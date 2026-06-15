import * as agentService from '../services/agent.service.js';
import * as balanceRequestService from '../services/balanceRequest.service.js';
import * as exchangeRateService from '../services/exchangeRate.service.js';
import * as providerService from '../services/provider.service.js';
import * as catalogService from '../services/catalog.service.js';
import * as transactionService from '../services/transaction.service.js';
import * as orderService from '../services/order.service.js';

export async function listAgents(req, res, next) {
  try {
    const data = await agentService.listAgents({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function createAgent(req, res, next) {
  try {
    const agent = await agentService.createAgent(req.body);
    res.status(201).json({ success: true, data: { agent } });
  } catch (err) {
    next(err);
  }
}

export async function updateAgent(req, res, next) {
  try {
    const agent = await agentService.updateAgent(req.params.id, req.body);
    res.json({ success: true, data: { agent } });
  } catch (err) {
    next(err);
  }
}

export async function depositToAgent(req, res, next) {
  try {
    const transaction = await agentService.depositToAgent({
      agentId: req.params.id,
      amount: req.body.amount,
      adminId: req.user._id,
      note: req.body.note,
      idempotencyKey: req.body.idempotencyKey,
    });
    res.status(201).json({ success: true, data: { transaction } });
  } catch (err) {
    next(err);
  }
}

export async function withdrawFromAgent(req, res, next) {
  try {
    const transaction = await agentService.withdrawFromAgent({
      agentId: req.params.id,
      amount: req.body.amount,
      adminId: req.user._id,
      note: req.body.note,
      idempotencyKey: req.body.idempotencyKey,
    });
    res.status(201).json({ success: true, data: { transaction } });
  } catch (err) {
    next(err);
  }
}

export async function listBalanceRequests(req, res, next) {
  try {
    const data = await balanceRequestService.listBalanceRequests({
      status: req.query.status,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function approveBalanceRequest(req, res, next) {
  try {
    const request = await balanceRequestService.approveBalanceRequest({
      requestId: req.params.id,
      adminId: req.user._id,
      idempotencyKey: req.body.idempotencyKey,
    });
    res.json({ success: true, data: { request } });
  } catch (err) {
    next(err);
  }
}

export async function rejectBalanceRequest(req, res, next) {
  try {
    const request = await balanceRequestService.rejectBalanceRequest({
      requestId: req.params.id,
      adminId: req.user._id,
      reason: req.body.reason,
    });
    res.json({ success: true, data: { request } });
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

export async function setExchangeRate(req, res, next) {
  try {
    const rate = await exchangeRateService.setExchangeRate({
      rate: req.body.rate,
      setBy: req.user._id,
      note: req.body.note,
    });
    res.status(201).json({ success: true, data: { rate } });
  } catch (err) {
    next(err);
  }
}

export async function listExchangeRates(req, res, next) {
  try {
    const rates = await exchangeRateService.listExchangeRates();
    res.json({ success: true, data: { rates } });
  } catch (err) {
    next(err);
  }
}

export async function listProviders(req, res, next) {
  try {
    const providers = await providerService.listProviders();
    res.json({ success: true, data: { providers } });
  } catch (err) {
    next(err);
  }
}

export async function createProvider(req, res, next) {
  try {
    const provider = await providerService.createProvider(req.body);
    res.status(201).json({ success: true, data: { provider } });
  } catch (err) {
    next(err);
  }
}

export async function updateProvider(req, res, next) {
  try {
    const provider = await providerService.updateProvider(req.params.id, req.body);
    res.json({ success: true, data: { provider } });
  } catch (err) {
    next(err);
  }
}

export async function syncProviderBalance(req, res, next) {
  try {
    const provider = await providerService.syncProviderBalance(req.params.id);
    res.json({ success: true, data: { provider } });
  } catch (err) {
    next(err);
  }
}

export async function syncProviderProducts(req, res, next) {
  try {
    const result = await providerService.syncProviderProducts(req.params.id, {
      adminId: req.user._id,
      marginPercent: Number(req.body.marginPercent) || 0,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function listServices(req, res, next) {
  try {
    const services = await catalogService.listServices({
      providerId: req.query.providerId,
    });
    res.json({ success: true, data: { services } });
  } catch (err) {
    next(err);
  }
}

export async function createService(req, res, next) {
  try {
    const service = await catalogService.createService(req.body);
    res.status(201).json({ success: true, data: { service } });
  } catch (err) {
    next(err);
  }
}

export async function updateService(req, res, next) {
  try {
    const service = await catalogService.updateService(req.params.id, req.body);
    res.json({ success: true, data: { service } });
  } catch (err) {
    next(err);
  }
}

export async function deleteService(req, res, next) {
  try {
    const service = await catalogService.deleteService(req.params.id);
    res.json({ success: true, data: { service } });
  } catch (err) {
    next(err);
  }
}

export async function listTransactions(req, res, next) {
  try {
    const data = await transactionService.listTransactions({
      userId: req.query.userId,
      type: req.query.type,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 30,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function listOrders(req, res, next) {
  try {
    const data = await orderService.listOrders({
      performedBy: req.query.agentId,
      status: req.query.status,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    res.json({ success: true, data });
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

export async function refreshOrderStatus(req, res, next) {
  try {
    const order = await orderService.refreshOrderStatus(req.params.id);
    res.json({ success: true, data: { order } });
  } catch (err) {
    next(err);
  }
}
