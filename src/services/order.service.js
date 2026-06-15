import crypto from 'crypto';
import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Service } from '../models/Service.js';
import { ExchangeRate } from '../models/ExchangeRate.js';
import { ORDER_STATUS, TRANSACTION_TYPES } from '../constants/index.js';
import { adjustUserBalance, adjustProviderBalance } from './ledger.service.js';
import { createProviderClient } from '../providers/index.js';
import { validateQuantity } from '../utils/quantity.js';
import { calculateOrderAmounts } from '../utils/pricing.js';
import { mapProviderStatus } from '../utils/orderStatus.js';
import { toMoney } from '../utils/money.js';
import { msg } from '../constants/messages.js';

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

  const session = await mongoose.startSession();
  let order;

  try {
    await session.withTransaction(async () => {
      const [createdOrder] = await Order.create(
        [
          {
            service: service._id,
            externalProvider: service.externalProvider._id,
            performedBy: performedBy._id,
            status: ORDER_STATUS.PROCESSING,
            amountSYP: toMoney(amountSYP),
            costUSD: toMoney(costUSD),
            exchangeRateAtOrder: exchangeRate.rate,
            quantity: qty,
            customerInput,
            externalOrderUuid: orderUuid,
            idempotencyKey,
          },
        ],
        { session }
      );

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
      order = createdOrder;
    });
  } finally {
    session.endSession();
  }

  try {
    const client = createProviderClient(service.externalProvider);
    const providerResult = await client.createOrder({
      productId: service.externalServiceId,
      quantity: qty,
      params: customerInput,
      orderUuid,
    });

    order.externalOrderId = providerResult.orderId;
    order.providerResponse = providerResult.raw;
    order.status = mapProviderStatus(
      service.externalProvider.providerType,
      providerResult.status
    );
    await order.save();
  } catch (err) {
    await refundFailedOrder(order, performedBy._id, err.message);
    throw err;
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

export async function listOrders({ performedBy, page = 1, limit = 20, status } = {}) {
  const filter = {};
  if (performedBy) filter.performedBy = performedBy;
  if (status) filter.status = status;

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
