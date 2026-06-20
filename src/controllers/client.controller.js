import * as orderService from '../services/order.service.js';
import * as transactionService from '../services/transaction.service.js';
import * as exchangeRateService from '../services/exchangeRate.service.js';

export async function placeOrder(req, res, next) {
  try {
    // Check if this is a frontend order (with provider info) or service-based order
    if (req.body.providerType && req.body.productId) {
      const order = await orderService.placeOrderFromFrontend({
        performedBy: req.user,
        providerType: req.body.providerType,
        productId: req.body.productId,
        quantity: req.body.quantity,
        customerInput: req.body.customerInput,
        price: req.body.price,
        idempotencyKey: req.body.idempotencyKey,
      });
      res.status(201).json({ success: true, data: { order } });
    } else {
      const order = await orderService.placeOrder({
        performedBy: req.user,
        serviceId: req.body.serviceId,
        quantity: req.body.quantity,
        customerInput: req.body.customerInput,
        idempotencyKey: req.body.idempotencyKey,
      });
      res.status(201).json({ success: true, data: { order } });
    }
  } catch (err) {
    next(err);
  }
}

export async function listOrders(req, res, next) {
  try {
    const data = await orderService.listOrders({
      performedBy: req.user._id,
      status: req.query.status,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await orderService.getOrderById(req.params.id, {
      performedBy: req.user._id,
    });
    res.json({ success: true, data: { order } });
  } catch (err) {
    next(err);
  }
}

export async function refreshOrderStatus(req, res, next) {
  try {
    const order = await orderService.refreshOrderStatus(req.params.id, {
      performedBy: req.user._id,
    });
    res.json({ success: true, data: { order } });
  } catch (err) {
    next(err);
  }
}

export async function listTransactions(req, res, next) {
  try {
    const data = await transactionService.listTransactions({
      userId: req.user._id,
      type: req.query.type,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 30,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
