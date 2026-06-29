import { Order } from '../models/Order.js';
import { ExternalProvider } from '../models/ExternalProvider.js';
import { ORDER_STATUS, TRANSACTION_TYPES } from '../constants/index.js';
import { createProviderClient } from '../providers/index.js';
import { mapProviderStatus } from '../utils/orderStatus.js';
import { adjustUserBalance, adjustProviderBalance } from './ledger.service.js';
import { toMoney } from '../utils/money.js';

// Configuration for the background job
const CHECK_INTERVAL = 2 * 60 * 1000; // Check every 2 minutes
const BATCH_SIZE = 50; // Process 50 orders at a time
const MAX_RETRY_ATTEMPTS = 10; // Maximum retry attempts for failed checks

let isRunning = false;
let intervalId = null;

/**
 * Background job to check order statuses from providers
 * - Finds orders with PROCESSING status
 * - Checks their status with the provider
 * - If cancelled/rejected, refunds the user
 * - If completed, updates the order status
 */
export async function checkOrderStatuses() {
  if (isRunning) {
    console.log('Order status check already running, skipping...');
    return;
  }

  isRunning = true;
  console.log('Starting order status check...');

  try {
    // Find orders that are in PROCESSING status
    // Exclude orders that have been checked too many times
    const processingOrders = await Order.find({
      status: ORDER_STATUS.PROCESSING,
      $or: [
        { statusCheckAttempts: { $exists: false } },
        { statusCheckAttempts: { $lt: MAX_RETRY_ATTEMPTS } },
      ],
    })
      .populate('externalProvider')
      .sort({ createdAt: 1 })
      .limit(BATCH_SIZE);

    if (processingOrders.length === 0) {
      console.log('No processing orders found');
      return;
    }

    console.log(`Found ${processingOrders.length} processing orders to check`);

    // Group orders by provider to minimize API calls
    const ordersByProvider = new Map();
    for (const order of processingOrders) {
      const providerId = order.externalProvider._id.toString();
      if (!ordersByProvider.has(providerId)) {
        ordersByProvider.set(providerId, []);
      }
      ordersByProvider.get(providerId).push(order);
    }

    // Check orders for each provider
    for (const [providerId, orders] of ordersByProvider) {
      await checkOrdersForProvider(orders);
    }

    console.log('Order status check completed');
  } catch (error) {
    console.error('Error during order status check:', error);
  } finally {
    isRunning = false;
  }
}

async function checkOrdersForProvider(orders) {
  const provider = orders[0].externalProvider;
  if (!provider || !provider.isActive) {
    console.log(`Provider ${provider.name} is not active, skipping`);
    return;
  }

  try {
    const client = createProviderClient(provider);
    
    // Collect order IDs to check
    const orderIds = orders
      .map(order => order.externalOrderId || order.externalOrderUuid)
      .filter(id => id);

    if (orderIds.length === 0) {
      console.log('No valid order IDs to check');
      return;
    }

    console.log(`Checking ${orderIds.length} orders for provider ${provider.name}`);

    // Check orders with provider
    const useUuid = !orders[0].externalOrderId;
    const results = await client.checkOrders({
      orderIds,
      useUuid,
    });

    // Create a map of provider order ID to result
    const resultMap = new Map();
    for (const result of results) {
      resultMap.set(result.orderId, result);
    }

    // Update each order based on provider response
    for (const order of orders) {
      const checkId = order.externalOrderId || order.externalOrderUuid;
      const result = resultMap.get(checkId);

      if (!result) {
        // Order not found in provider response, increment attempt counter
        await Order.findByIdAndUpdate(order._id, {
          $inc: { statusCheckAttempts: 1 },
        });
        continue;
      }

      const newStatus = mapProviderStatus(provider.providerType, result.status);
      
      // Update order status and provider response
      order.status = newStatus;
      order.providerResponse = {
        ...order.providerResponse,
        latestCheck: result.raw,
      };
      order.statusCheckAttempts = 0; // Reset attempts on successful check

      // Handle status changes
      if (newStatus === ORDER_STATUS.COMPLETED) {
        console.log(`Order ${order._id} completed successfully`);
        await order.save();
      } else if (newStatus === ORDER_STATUS.FAILED || newStatus === ORDER_STATUS.CANCELLED) {
        console.log(`Order ${order._id} failed/cancelled, initiating refund`);
        await refundFailedOrder(order, result.status);
      } else {
        // Still processing, just update the check info
        await order.save();
      }
    }
  } catch (error) {
    console.error(`Error checking orders for provider ${provider.name}:`, error);
    
    // Increment attempt counter for all orders in this batch
    for (const order of orders) {
      await Order.findByIdAndUpdate(order._id, {
        $inc: { statusCheckAttempts: 1 },
      });
    }
  }
}

async function refundFailedOrder(order, providerStatus) {
  const session = await Order.startSession();
  try {
    await session.withTransaction(async () => {
      const freshOrder = await Order.findById(order._id).session(session);
      if (!freshOrder || freshOrder.status === ORDER_STATUS.FAILED || freshOrder.status === ORDER_STATUS.CANCELLED) {
        return;
      }

      // Refund user balance
      const refundTx = await adjustUserBalance({
        userId: freshOrder.performedBy,
        amount: freshOrder.amountSYP,
        type: TRANSACTION_TYPES.ORDER_REFUND,
        performedBy: freshOrder.performedBy,
        order: freshOrder._id,
        idempotencyKey: `order:${freshOrder._id}:refund:user`,
        description: `Refund for failed/cancelled order ${freshOrder._id} - Provider status: ${providerStatus}`,
        session,
      });

      // Credit provider balance
      await adjustProviderBalance({
        providerId: freshOrder.externalProvider,
        amount: freshOrder.costUSD,
        type: TRANSACTION_TYPES.EXTERNAL_PROVIDER_CREDIT,
        performedBy: freshOrder.performedBy,
        order: freshOrder._id,
        idempotencyKey: `order:${freshOrder._id}:refund:provider`,
        description: `Refund for failed/cancelled order ${freshOrder._id} - Provider status: ${providerStatus}`,
        session,
      });

      // Update order status
      freshOrder.status = providerStatus === 'cancelled' ? ORDER_STATUS.CANCELLED : ORDER_STATUS.FAILED;
      freshOrder.failureReason = `Order ${providerStatus} by provider`;
      freshOrder.refundTransaction = refundTx._id;
      freshOrder.statusCheckAttempts = 0;
      await freshOrder.save({ session });

      console.log(`Refunded order ${freshOrder._id}: ${freshOrder.amountSYP} SYP to user, ${freshOrder.costUSD} USD to provider`);
    });
  } finally {
    session.endSession();
  }
}

/**
 * Start the background job
 */
export function startOrderStatusCheckJob() {
  if (intervalId) {
    console.log('Order status check job already running');
    return;
  }

  console.log(`Starting order status check job (interval: ${CHECK_INTERVAL}ms)`);
  
  // Run immediately on start
  checkOrderStatuses();
  
  // Then run periodically
  intervalId = setInterval(checkOrderStatuses, CHECK_INTERVAL);
}

/**
 * Stop the background job
 */
export function stopOrderStatusCheckJob() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('Order status check job stopped');
  }
}

/**
 * Manually trigger a status check (for testing or admin use)
 */
export async function triggerManualStatusCheck() {
  await checkOrderStatuses();
}
