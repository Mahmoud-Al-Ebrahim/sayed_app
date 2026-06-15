import mongoose from 'mongoose';
import { BalanceRequest } from '../models/BalanceRequest.js';
import { User } from '../models/User.js';
import { BALANCE_REQUEST_STATUS, ROLES, TRANSACTION_TYPES } from '../constants/index.js';
import { msg } from '../constants/messages.js';
import { adjustUserBalance } from './ledger.service.js';
import { toMoney } from '../utils/money.js';

export async function createBalanceRequest({ agentId, amount, note }) {
  if (!amount || Number(amount) <= 0) throw new Error(msg.BALANCE_REQUEST_AMOUNT_INVALID);

  const agent = await User.findOne({ _id: agentId, role: ROLES.AGENT, isActive: true });
  if (!agent) throw new Error(msg.AGENT_NOT_FOUND_OR_INACTIVE);

  const pending = await BalanceRequest.findOne({
    agent: agentId,
    status: BALANCE_REQUEST_STATUS.PENDING,
  });
  if (pending) throw new Error(msg.BALANCE_REQUEST_PENDING_EXISTS);

  return BalanceRequest.create({
    agent: agentId,
    amountSYP: toMoney(amount),
    note,
  });
}

export async function listBalanceRequests({ status, agentId, page = 1, limit = 20 } = {}) {
  const filter = {};
  if (status) filter.status = status;
  if (agentId) filter.agent = agentId;

  const skip = (page - 1) * limit;
  const [requests, total] = await Promise.all([
    BalanceRequest.find(filter)
      .populate('agent', 'name email balance')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    BalanceRequest.countDocuments(filter),
  ]);

  return { requests, total, page, limit };
}

export async function approveBalanceRequest({ requestId, adminId, idempotencyKey }) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const request = await BalanceRequest.findById(requestId).session(session);
      if (!request) throw new Error(msg.BALANCE_REQUEST_NOT_FOUND);
      if (request.status !== BALANCE_REQUEST_STATUS.PENDING) {
        throw new Error(msg.BALANCE_REQUEST_NOT_PENDING);
      }

      const transaction = await adjustUserBalance({
        userId: request.agent,
        amount: request.amountSYP,
        type: TRANSACTION_TYPES.AGENT_DEPOSIT,
        performedBy: adminId,
        counterparty: adminId,
        description: request.note || 'موافقة على طلب شحن',
        balanceRequest: request._id,
        idempotencyKey: idempotencyKey || `balance-request:${request._id}`,
        session,
      });

      request.status = BALANCE_REQUEST_STATUS.APPROVED;
      request.reviewedBy = adminId;
      request.reviewedAt = new Date();
      request.transaction = transaction._id;
      await request.save({ session });

      result = await BalanceRequest.findById(request._id)
        .populate('agent', 'name email balance')
        .populate('reviewedBy', 'name email')
        .session(session);
    });
    return result;
  } finally {
    session.endSession();
  }
}

export async function rejectBalanceRequest({ requestId, adminId, reason }) {
  const request = await BalanceRequest.findById(requestId);
  if (!request) throw new Error(msg.BALANCE_REQUEST_NOT_FOUND);
  if (request.status !== BALANCE_REQUEST_STATUS.PENDING) {
    throw new Error(msg.BALANCE_REQUEST_NOT_PENDING);
  }

  request.status = BALANCE_REQUEST_STATUS.REJECTED;
  request.reviewedBy = adminId;
  request.reviewedAt = new Date();
  request.rejectionReason = reason || 'مرفوض من الإدارة';
  await request.save();

  return request.populate('agent', 'name email');
}
