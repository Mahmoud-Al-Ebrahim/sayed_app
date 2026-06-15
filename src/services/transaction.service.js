import { Transaction } from '../models/Transaction.js';

export async function listTransactions({ userId, page = 1, limit = 30, type } = {}) {
  const filter = {};
  if (userId) filter.user = userId;
  if (type) filter.type = type;

  const skip = (page - 1) * limit;
  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate('user', 'name email role')
      .populate('performedBy', 'name email role')
      .populate('counterparty', 'name email')
      .populate('externalProvider', 'name providerType')
      .populate('order', 'status amountSYP costUSD')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments(filter),
  ]);

  return { transactions, total, page, limit };
}
