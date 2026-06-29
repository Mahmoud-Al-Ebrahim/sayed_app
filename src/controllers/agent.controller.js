import * as balanceRequestService from '../services/balanceRequest.service.js';
import * as catalogService from '../services/catalog.service.js';
import * as orderService from '../services/order.service.js';
import * as transactionService from '../services/transaction.service.js';
import * as exchangeRateService from '../services/exchangeRate.service.js';
import { User } from '../models/User.js';
import { ROLES, TRANSACTION_TYPES } from '../constants/index.js';
import { adjustUserBalance } from '../services/ledger.service.js';
import { msg } from '../constants/messages.js';

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
      providerStatus: req.query.providerStatus,
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

export async function transferToClient(req, res, next) {
  try {
    const { clientIntegerId, amount, note } = req.body;

    if (!clientIntegerId || !amount) {
      return res.status(400).json({ success: false, message: 'Client ID and amount are required' });
    }

    const client = await User.findByIntegerId(parseInt(clientIntegerId));
    
    if (!client) {
      return res.status(404).json({ success: false, message: msg.USER_NOT_FOUND });
    }

    if (client.role !== ROLES.CLIENT) {
      return res.status(400).json({ success: false, message: 'Target user is not a client' });
    }

    // Debit from agent
    const debitTx = await adjustUserBalance({
      userId: req.user._id,
      amount: amount,
      type: TRANSACTION_TYPES.AGENT_TO_CLIENT_TRANSFER,
      performedBy: req.user._id,
      counterparty: client._id,
      isDebit: true,
      description: note || `Transfer to client ${client.integerId}`,
      idempotencyKey: req.body.idempotencyKey,
    });

    // Credit to client
    const creditTx = await adjustUserBalance({
      userId: client._id,
      amount: amount,
      type: TRANSACTION_TYPES.AGENT_TO_CLIENT_TRANSFER,
      performedBy: req.user._id,
      counterparty: req.user._id,
      description: note || `Transfer from agent`,
      idempotencyKey: req.body.idempotencyKey ? `${req.body.idempotencyKey}:credit` : null,
    });

    res.status(201).json({ success: true, data: { debitTransaction: debitTx, creditTransaction: creditTx } });
  } catch (err) {
    next(err);
  }
}
