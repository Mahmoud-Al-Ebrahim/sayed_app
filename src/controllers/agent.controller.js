import * as balanceRequestService from '../services/balanceRequest.service.js';
import * as catalogService from '../services/catalog.service.js';
import * as orderService from '../services/order.service.js';
import * as transactionService from '../services/transaction.service.js';
import * as exchangeRateService from '../services/exchangeRate.service.js';

export async function createBalanceRequest(req, res, next) {
  try {
    const request = await balanceRequestService.createBalanceRequest({
      agentId: req.user._id,
      amount: req.body.amount,
      note: req.body.note,
    });
    res.status(201).json({ success: true, data: { request } });
  } catch (err) {
    next(err);
  }
}

export async function listBalanceRequests(req, res, next) {
  try {
    const data = await balanceRequestService.listBalanceRequests({
      agentId: req.user._id,
      status: req.query.status,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function listServices(req, res, next) {
  try {
    const services = await catalogService.listServices({ activeOnly: true });
    res.json({ success: true, data: { services } });
  } catch (err) {
    next(err);
  }
}

export async function getExchangeRate(req, res, next) {
  try {
    const rate = await exchangeRateService.getActiveRate();
    res.json({ success: true, data: { rate } });
  } catch (err) {
    next(err);
  }
}

export async function placeOrder(req, res, next) {
  try {
    const order = await orderService.placeOrder({
      performedBy: req.user,
      serviceId: req.body.serviceId,
      quantity: req.body.quantity,
      customerInput: req.body.customerInput,
      idempotencyKey: req.body.idempotencyKey,
    });
    res.status(201).json({ success: true, data: { order } });
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
