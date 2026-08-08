import * as orderService from '../services/order.service.js';
import * as transactionService from '../services/transaction.service.js';
import * as exchangeRateService from '../services/exchangeRate.service.js';
import { getMergedProducts } from '../services/mergedProducts.service.js';
import { Agent } from '../models/Agent.js';

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
        category: req.body.category,
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
      providerStatus: req.query.providerStatus,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      includeProviderInfo: false, // Clients don't see provider information
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
      includeProviderInfo: false, // Clients don't see provider information
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

export async function getProfile(req, res, next) {
  try {
    res.json({ success: true, data: { user: req.user } });
  } catch (err) {
    next(err);
  }
}

export async function listServices(req, res, next) {
  try {
    const includeProfits = req.query.includeProfits === 'true';
    const products = await getMergedProducts({ 
      includeProfits,
      userRole: 'client',
      userBadgeId: req.user.badge
    });
    res.json({ success: true, data: { products } });
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

export async function listAgents(req, res, next) {
  try {
    const agents = await Agent.find().sort({ createdAt: -1 });
    res.json({ success: true, data: { agents } });
  } catch (err) {
    next(err);
  }
}
