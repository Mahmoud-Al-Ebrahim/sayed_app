import * as exchangeRateService from '../services/exchangeRate.service.js';
import * as providerService from '../services/provider.service.js';
import * as catalogService from '../services/catalog.service.js';
import * as transactionService from '../services/transaction.service.js';
import * as orderService from '../services/order.service.js';
import * as badgeService from '../services/badge.service.js';
import { getMergedProducts } from '../services/mergedProducts.service.js';
import { User } from '../models/User.js';
import { ProviderDeposit } from '../models/ProviderDeposit.js';
import { ROLES, TRANSACTION_TYPES, ORDER_STATUS } from '../constants/index.js';
import { adjustUserBalance } from '../services/ledger.service.js';
import { toMoney } from '../utils/money.js';
import { msg } from '../constants/messages.js';

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
    const includeProfits = req.query.includeProfits === 'true';
    const products = await getMergedProducts({ 
      includeProfits,
      userRole: 'admin',
      userBadgeId: null
    });
    res.json({ success: true, data: { products } });
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
      filterUserId: req.query.userId, // Admin can filter by specific client/user
      status: req.query.status,
      providerStatus: req.query.providerStatus,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      includeProviderInfo: true, // Admin sees provider information
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getClientOrders(req, res, next) {
  try {
    const integerId = parseInt(req.params.integerId);
    const client = await User.findByIntegerId(integerId);
    
    if (!client) {
      return res.status(404).json({ success: false, message: msg.USER_NOT_FOUND });
    }

    if (client.role !== ROLES.CLIENT) {
      return res.status(400).json({ success: false, message: 'User is not a client' });
    }

    const data = await orderService.listOrders({
      filterUserId: client._id,
      status: req.query.status,
      providerStatus: req.query.providerStatus,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      includeProviderInfo: true,
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

export async function listClients(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search;
    
    const query = { role: ROLES.CLIENT };
    
    if (search) {
      const searchNum = parseInt(search);
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { integerId: !isNaN(searchNum) ? searchNum : null },
      ].filter(item => item.integerId !== null || item.name || item.email);
    }

    const [clients, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash -refreshTokens')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(query),
    ]);

    res.json({ success: true, data: { clients, total, page, limit } });
  } catch (err) {
    next(err);
  }
}

export async function getClientByIntegerId(req, res, next) {
  try {
    const integerId = parseInt(req.params.integerId);
    const client = await User.findByIntegerId(integerId);
    
    if (!client) {
      return res.status(404).json({ success: false, message: msg.USER_NOT_FOUND });
    }

    if (client.role !== ROLES.CLIENT) {
      return res.status(400).json({ success: false, message: 'User is not a client' });
    }

    res.json({ success: true, data: { client } });
  } catch (err) {
    next(err);
  }
}

export async function updateClientPassword(req, res, next) {
  try {
    const integerId = parseInt(req.params.integerId);
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    const client = await User.findByIntegerId(integerId);
    
    if (!client) {
      return res.status(404).json({ success: false, message: msg.USER_NOT_FOUND });
    }

    if (client.role !== ROLES.CLIENT) {
      return res.status(400).json({ success: false, message: 'User is not a client' });
    }

    await client.setPassword(password);
    await client.save();

    res.json({ success: true, data: { message: 'Password updated successfully' } });
  } catch (err) {
    next(err);
  }
}

export async function blockClient(req, res, next) {
  try {
    const integerId = parseInt(req.params.integerId);
    const client = await User.findByIntegerId(integerId);
    
    if (!client) {
      return res.status(404).json({ success: false, message: msg.USER_NOT_FOUND });
    }

    if (client.role !== ROLES.CLIENT) {
      return res.status(400).json({ success: false, message: 'User is not a client' });
    }

    client.isBlocked = true;
    await client.save();

    res.json({ success: true, data: { message: 'Client blocked successfully' } });
  } catch (err) {
    next(err);
  }
}

export async function unblockClient(req, res, next) {
  try {
    const integerId = parseInt(req.params.integerId);
    const client = await User.findByIntegerId(integerId);
    
    if (!client) {
      return res.status(404).json({ success: false, message: msg.USER_NOT_FOUND });
    }

    if (client.role !== ROLES.CLIENT) {
      return res.status(400).json({ success: false, message: 'User is not a client' });
    }

    client.isBlocked = false;
    await client.save();

    res.json({ success: true, data: { message: 'Client unblocked successfully' } });
  } catch (err) {
    next(err);
  }
}

export async function getClientTransactions(req, res, next) {
  try {
    const integerId = parseInt(req.params.integerId);
    const client = await User.findByIntegerId(integerId);
    
    if (!client) {
      return res.status(404).json({ success: false, message: msg.USER_NOT_FOUND });
    }

    if (client.role !== ROLES.CLIENT) {
      return res.status(400).json({ success: false, message: 'User is not a client' });
    }

    const data = await transactionService.listTransactions({
      userId: client._id,
      type: req.query.type,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 30,
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function depositToClient(req, res, next) {
  try {
    const client = await User.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ success: false, message: msg.USER_NOT_FOUND });
    }

    if (client.role !== ROLES.CLIENT) {
      return res.status(400).json({ success: false, message: 'User is not a client' });
    }

    const transaction = await adjustUserBalance({
      userId: client._id,
      amount: req.body.amount,
      type: TRANSACTION_TYPES.CLIENT_DEPOSIT,
      performedBy: req.user._id,
      counterparty: req.user._id,
      description: req.body.note || 'Admin deposit to client',
      idempotencyKey: req.body.idempotencyKey,
    });

    res.status(201).json({ success: true, data: { transaction } });
  } catch (err) {
    next(err);
  }
}

export async function withdrawFromClient(req, res, next) {
  try {
    const client = await User.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ success: false, message: msg.USER_NOT_FOUND });
    }

    if (client.role !== ROLES.CLIENT) {
      return res.status(400).json({ success: false, message: 'User is not a client' });
    }

    const transaction = await adjustUserBalance({
      userId: client._id,
      amount: -req.body.amount, // Negative amount for withdrawal
      type: TRANSACTION_TYPES.CLIENT_WITHDRAW,
      performedBy: req.user._id,
      counterparty: req.user._id,
      description: req.body.note || 'Admin withdrawal from client',
      idempotencyKey: req.body.idempotencyKey,
    });

    res.status(201).json({ success: true, data: { transaction } });
  } catch (err) {
    next(err);
  }
}

export async function createProviderDeposit(req, res, next) {
  try {
    const { provider, amount, currency, depositDate, notes } = req.body;

    const deposit = new ProviderDeposit({
      provider,
      amount,
      currency,
      depositDate: new Date(depositDate),
      notes,
      depositedBy: req.user._id,
    });

    await deposit.save();

    res.status(201).json({ success: true, data: { deposit } });
  } catch (err) {
    next(err);
  }
}

export async function listProviderDeposits(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const provider = req.query.provider;

    const query = {};
    if (provider) {
      query.provider = provider;
    }

    const [deposits, total] = await Promise.all([
      ProviderDeposit.find(query)
        .populate('depositedBy', 'name email')
        .sort({ depositDate: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      ProviderDeposit.countDocuments(query),
    ]);

    res.json({ success: true, data: { deposits, total, page, limit } });
  } catch (err) {
    next(err);
  }
}

export async function getProviderDeposit(req, res, next) {
  try {
    const deposit = await ProviderDeposit.findById(req.params.id)
      .populate('depositedBy', 'name email');

    if (!deposit) {
      return res.status(404).json({ success: false, message: 'Deposit not found' });
    }

    res.json({ success: true, data: { deposit } });
  } catch (err) {
    next(err);
  }
}

export async function deleteProviderDeposit(req, res, next) {
  try {
    const deposit = await ProviderDeposit.findById(req.params.id);

    if (!deposit) {
      return res.status(404).json({ success: false, message: 'Deposit not found' });
    }

    await ProviderDeposit.findByIdAndDelete(req.params.id);

    res.json({ success: true, data: { deposit } });
  } catch (err) {
    next(err);
  }
}

export async function acceptWaitOrder(req, res, next) {
  try {
    const { orderId } = req.params;
    const order = await orderService.acceptWaitOrder(orderId, req.user._id);
    res.json({ success: true, data: { order } });
  } catch (err) {
    next(err);
  }
}

export async function rejectWaitOrder(req, res, next) {
  try {
    const { orderId } = req.params;
    const { rejectionNote } = req.body;
    
    if (!rejectionNote) {
      return res.status(400).json({ success: false, message: 'Rejection note is required' });
    }
    
    const order = await orderService.rejectWaitOrder(orderId, req.user._id, rejectionNote);
    res.json({ success: true, data: { order } });
  } catch (err) {
    next(err);
  }
}

export async function listWaitOrders(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { orders, total } = await orderService.listOrders({
      page: parseInt(page),
      limit: parseInt(limit),
      status: ORDER_STATUS.WAIT,
    });
    
    res.json({ 
      success: true, 
      data: { orders },
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
}
