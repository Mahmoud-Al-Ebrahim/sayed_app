import crypto from 'crypto';
import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Service } from '../models/Service.js';
import { ExchangeRate } from '../models/ExchangeRate.js';
import { ExternalProvider } from '../models/ExternalProvider.js';
import { Badge } from '../models/Badge.js';
import { ORDER_STATUS, TRANSACTION_TYPES, PROVIDER_TYPES } from '../constants/index.js';
import { adjustUserBalance, adjustProviderBalance } from './ledger.service.js';
import { createProviderClient, ProviderError } from '../providers/index.js';
import { validateQuantity } from '../utils/quantity.js';
import { calculateOrderAmounts } from '../utils/pricing.js';
import { mapProviderStatus } from '../utils/orderStatus.js';
import { toMoney } from '../utils/money.js';
import { msg } from '../constants/messages.js';
import { getSellPriceForOrder } from './productProfit.service.js';

function validateCustomerInput(service, customerInput = {}) {
  for (const field of service.requiredFields || []) {
    if (field.required === false) continue;

    const value = customerInput[field.key];
    if (value == null || String(value).trim() === '') {
      throw new Error(msg.FIELD_REQUIRED(field.label || field.key));
    }

    if (field.type === 'select' && field.options?.length) {
      const allowed = field.options.map((opt) => String(opt.value));
      if (!allowed.includes(String(value))) {
        throw new Error(msg.FIELD_INVALID_OPTION(field.label || field.key));
      }
    }
  }
}

export async function placeOrder({
  performedBy,
  serviceId,
  quantity = 1,
  customerInput = {},
  idempotencyKey = null,
}) {
  if (idempotencyKey) {
    const existing = await Order.findOne({ idempotencyKey })
      .populate('service')
      .populate('performedBy', 'name email role');
    if (existing) return existing;
  }

  const service = await Service.findById(serviceId).populate('externalProvider');
  if (!service || !service.isActive) throw new Error(msg.SERVICE_NOT_FOUND_OR_INACTIVE);
  if (!service.externalProvider?.isActive) {
    throw new Error(msg.PROVIDER_NOT_ACTIVE);
  }

  const qty = validateQuantity(quantity, service.quantityRules);
  validateCustomerInput(service, customerInput);

  const exchangeRate = await ExchangeRate.getActiveRate();
  const { amountSYP, costUSD } = calculateOrderAmounts(service, qty);
  const orderUuid = crypto.randomUUID();

  // Step 1: Create order with provider first
  const client = createProviderClient(service.externalProvider);
  let providerResult;
  try {
    providerResult = await client.createOrder({
      productId: service.externalServiceId,
      quantity: qty,
      params: customerInput,
      orderUuid,
    });
  } catch (err) {
    throw new ProviderError(msg.SHEHABI_ORDER_FAILED, { raw: err.message });
  }

  // Step 2: Reflect changes to local data
  const session = await mongoose.startSession();
  let order;

  try {
    await session.withTransaction(async () => {
      const mappedStatus = mapProviderStatus(
        service.externalProvider.providerType,
        providerResult.status
      );

      const [createdOrder] = await Order.create(
        [
          {
            service: service._id,
            externalProvider: service.externalProvider._id,
            performedBy: performedBy._id,
            status: mappedStatus,
            amountSYP: toMoney(amountSYP),
            costUSD: toMoney(costUSD),
            exchangeRateAtOrder: exchangeRate.rate,
            quantity: qty,
            customerInput,
            externalOrderId: providerResult.orderId,
            externalOrderUuid: orderUuid,
            providerResponse: providerResult.raw,
            idempotencyKey,
          },
        ],
        { session }
      );

      // Only debit balances if order is not failed/rejected
      if (mappedStatus !== ORDER_STATUS.FAILED && mappedStatus !== ORDER_STATUS.CANCELLED) {
        const userTx = await adjustUserBalance({
          userId: performedBy._id,
          amount: amountSYP,
          type: TRANSACTION_TYPES.SERVICE_ORDER,
          performedBy: performedBy._id,
          order: createdOrder._id,
          idempotencyKey: idempotencyKey ? `${idempotencyKey}:user` : `order:${createdOrder._id}:user`,
          description: `Service order ${createdOrder._id}`,
          metadata: { serviceId: service._id, quantity: qty },
          session,
        });

        await adjustProviderBalance({
          providerId: service.externalProvider._id,
          amount: costUSD,
          type: TRANSACTION_TYPES.EXTERNAL_PROVIDER_DEBIT,
          performedBy: performedBy._id,
          order: createdOrder._id,
          idempotencyKey: idempotencyKey
            ? `${idempotencyKey}:provider`
            : `order:${createdOrder._id}:provider`,
          description: `Service order ${createdOrder._id}`,
          metadata: { serviceId: service._id, quantity: qty },
          session,
        });

        createdOrder.debitTransaction = userTx._id;
        await createdOrder.save({ session });
      }

      order = createdOrder;
    });
  } finally {
    session.endSession();
  }

  return order.populate([
    { path: 'service', select: 'name sellingPriceSYP costPriceUSD' },
    { path: 'performedBy', select: 'name email role' },
    { path: 'externalProvider', select: 'name providerType' },
  ]);
}

async function refundFailedOrder(order, performedById, reason) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const freshOrder = await Order.findById(order._id).session(session);
      if (!freshOrder || freshOrder.status === ORDER_STATUS.FAILED) return;

      const refundTx = await adjustUserBalance({
        userId: freshOrder.performedBy,
        amount: freshOrder.amountSYP,
        type: TRANSACTION_TYPES.ORDER_REFUND,
        performedBy: performedById,
        order: freshOrder._id,
        idempotencyKey: `order:${freshOrder._id}:refund:user`,
        description: `Refund for failed order ${freshOrder._id}`,
        session,
      });

      await adjustProviderBalance({
        providerId: freshOrder.externalProvider,
        amount: freshOrder.costUSD,
        type: TRANSACTION_TYPES.EXTERNAL_PROVIDER_CREDIT,
        performedBy: performedById,
        order: freshOrder._id,
        idempotencyKey: `order:${freshOrder._id}:refund:provider`,
        description: `Refund for failed order ${freshOrder._id}`,
        session,
      });

      freshOrder.status = ORDER_STATUS.FAILED;
      freshOrder.failureReason = reason;
      freshOrder.refundTransaction = refundTx._id;
      await freshOrder.save({ session });
    });
  } finally {
    session.endSession();
  }

  order.status = ORDER_STATUS.FAILED;
  order.failureReason = reason;
}

export async function listOrders({ performedBy, page = 1, limit = 20, status, providerStatus } = {}) {
  const filter = {};
  // If performedBy is provided, filter by that user (for client/agent own orders or admin filtering by specific user)
  // If performedBy is not provided, return all orders (for admin viewing all orders)
  if (performedBy) filter.performedBy = performedBy;
  
  // Handle provider status filtering (accept, reject, wait, all)
  if (providerStatus && providerStatus !== 'all') {
    const providerStatusMap = {
      accept: ORDER_STATUS.COMPLETED,
      reject: ORDER_STATUS.FAILED,
      wait: ORDER_STATUS.PROCESSING,
    };
    filter.status = providerStatusMap[providerStatus];
  } else if (status) {
    // Use internal status if provided
    filter.status = status;
  }

  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('service', 'name')
      .populate('performedBy', 'name email role')
      .populate('externalProvider', 'name providerType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  return { orders, total, page, limit };
}

export async function getOrderById(orderId, { performedBy } = {}) {
  const filter = { _id: orderId };
  if (performedBy) filter.performedBy = performedBy;

  const order = await Order.findOne(filter)
    .populate('service')
    .populate('performedBy', 'name email role')
    .populate('externalProvider', 'name providerType');

  if (!order) throw new Error(msg.ORDER_NOT_FOUND);
  return order;
}

export async function refreshOrderStatus(orderId, { performedBy } = {}) {
  const order = await getOrderById(orderId, { performedBy });
  if (!order.externalOrderId && !order.externalOrderUuid) {
    throw new Error(msg.ORDER_NO_EXTERNAL_REF);
  }

  const provider = order.externalProvider;
  const client = createProviderClient(provider);

  const useUuid = !order.externalOrderId;
  const checkId = order.externalOrderId || order.externalOrderUuid;

  const results = await client.checkOrders({
    orderIds: [checkId],
    useUuid,
  });

  const latest = results[0];
  if (!latest) return order;

  order.status = mapProviderStatus(provider.providerType, latest.status);
  order.providerResponse = { ...order.providerResponse, latestCheck: latest.raw };
  await order.save();
  return order;
}

/**
 * Place an order using service info from frontend (shehabi or tempo)
 * The server determines which provider to use based on the service info
 */
export async function placeOrderFromFrontend({
  performedBy,
  providerType, // 'shehabi' or 'tempo'
  productId, // External product ID from shehabi or tempo
  quantity = 1,
  customerInput = {},
  price, // Base price from provider (in SYP for shehabi, USD for tempo)
  idempotencyKey = null,
}) {
  if (!providerType || !productId) {
    throw new Error(msg.SERVICE_NOT_FOUND_OR_INACTIVE);
  }

  if (!Object.values(PROVIDER_TYPES).includes(providerType)) {
    throw new Error('Invalid provider type');
  }

  // Get the active provider for the specified type
  const provider = await ExternalProvider.findOne({
    providerType,
    isActive: true,
  });

  if (!provider) {
    throw new Error(msg.PROVIDER_NOT_ACTIVE);
  }

  const exchangeRate = await ExchangeRate.getActiveRate();

  // Get user's badge (default to bronze if not set)
  let userBadge = await Badge.findOne({ name: 'bronze' });
  if (performedBy.badge) {
    userBadge = await Badge.findById(performedBy.badge);
  }
  if (!userBadge) {
    userBadge = await Badge.findOne({ name: 'bronze' });
  }

  // Get sell price for this product based on badge (provider-specific)
  const sellPrice = await getSellPriceForOrder({
    providerId: provider._id,
    productId,
    badgeId: userBadge._id,
    providerType,
  });

  // Calculate amounts based on provider type
  let amountSYP, costUSD, profitUSD;
  if (providerType === PROVIDER_TYPES.SHEHABI) {
    // Shehabi prices are in SYP (base price from provider, sell price in SYP)
    const baseCostSYP = price * quantity;
    const totalSellPriceSYP = sellPrice * quantity;
    costUSD = baseCostSYP / exchangeRate.rate; // Provider cost in USD
    amountSYP = totalSellPriceSYP; // Charge agent in SYP based on sell price
    profitUSD = (totalSellPriceSYP - baseCostSYP) / exchangeRate.rate; // Profit in USD
  } else {
    // Tempo prices are in USD (base price from provider, sell price in USD)
    costUSD = price * quantity; // Provider cost in USD
    const totalSellPriceUSD = sellPrice * quantity;
    profitUSD = totalSellPriceUSD - costUSD; // Profit in USD
    amountSYP = totalSellPriceUSD * exchangeRate.rate; // Charge agent in SYP based on sell price
  }

  const orderUuid = crypto.randomUUID();

  // Step 1: Create order with provider first
  const client = createProviderClient(provider);
  let providerResult;
  try {
    providerResult = await client.createOrder({
      productId,
      quantity,
      params: customerInput,
      orderUuid,
    });
  } catch (err) {
    throw new ProviderError(msg.TEMPO_ORDER_FAILED, { raw: err.message });
  }

  // Step 2: Reflect changes to local data
  const session = await mongoose.startSession();
  let order;

  try {
    await session.withTransaction(async () => {
      const mappedStatus = mapProviderStatus(provider.providerType, providerResult.status);

      const [createdOrder] = await Order.create(
        [
          {
            service: null, // No service reference for frontend orders
            externalProvider: provider._id,
            performedBy: performedBy._id,
            status: mappedStatus,
            amountSYP: toMoney(amountSYP),
            costUSD: toMoney(costUSD),
            profitUSD: toMoney(profitUSD * quantity),
            badge: userBadge._id,
            exchangeRateAtOrder: exchangeRate.rate,
            quantity,
            customerInput,
            externalOrderId: providerResult.orderId,
            externalOrderUuid: orderUuid,
            providerResponse: providerResult.raw,
            idempotencyKey,
          },
        ],
        { session }
      );

      // Only debit balances if order is not failed/rejected
      if (mappedStatus !== ORDER_STATUS.FAILED && mappedStatus !== ORDER_STATUS.CANCELLED) {
        const userTx = await adjustUserBalance({
          userId: performedBy._id,
          amount: amountSYP,
          type: TRANSACTION_TYPES.SERVICE_ORDER,
          performedBy: performedBy._id,
          order: createdOrder._id,
          idempotencyKey: idempotencyKey ? `${idempotencyKey}:user` : `order:${createdOrder._id}:user`,
          description: `Service order ${createdOrder._id} - ${providerType} product ${productId}`,
          metadata: { providerType, productId, quantity },
          session,
        });

        await adjustProviderBalance({
          providerId: provider._id,
          amount: costUSD,
          type: TRANSACTION_TYPES.EXTERNAL_PROVIDER_DEBIT,
          performedBy: performedBy._id,
          order: createdOrder._id,
          idempotencyKey: idempotencyKey
            ? `${idempotencyKey}:provider`
            : `order:${createdOrder._id}:provider`,
          description: `Service order ${createdOrder._id} - ${providerType} product ${productId}`,
          metadata: { providerType, productId, quantity },
          session,
        });

        createdOrder.debitTransaction = userTx._id;
        await createdOrder.save({ session });
      }

      order = createdOrder;
    });
  } finally {
    session.endSession();
  }

  return order.populate([
    { path: 'externalProvider', select: 'name providerType' },
    { path: 'performedBy', select: 'name email role' },
  ]);
}
