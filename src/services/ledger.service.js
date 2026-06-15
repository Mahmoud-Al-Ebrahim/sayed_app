import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';
import { ExternalProvider } from '../models/ExternalProvider.js';
import { TRANSACTION_TYPES, TRANSACTION_STATUS, CURRENCIES } from '../constants/index.js';
import { msg } from '../constants/messages.js';
import { toMoney, moneyToNumber, addMoney, subtractMoney } from '../utils/money.js';

class LedgerError extends Error {
  constructor(message, code = 'LEDGER_ERROR') {
    super(message);
    this.name = 'LedgerError';
    this.code = code;
  }
}

/**
 * Atomically credit or debit a user's SYP balance and write a ledger entry.
 * Uses optimistic locking (balanceVersion) inside a MongoDB transaction.
 */
export async function adjustUserBalance({
  userId,
  amount,
  type,
  performedBy,
  counterparty = null,
  description = '',
  metadata = {},
  idempotencyKey = null,
  order = null,
  balanceRequest = null,
  session: externalSession = null,
}) {
  if (idempotencyKey) {
    const existing = await Transaction.findOne({ idempotencyKey }).lean();
    if (existing) return existing;
  }

  const moneyAmount = toMoney(amount);
  const creditTypes = [TRANSACTION_TYPES.AGENT_DEPOSIT, TRANSACTION_TYPES.ORDER_REFUND];
  const debitTypes = [
    TRANSACTION_TYPES.AGENT_WITHDRAW,
    TRANSACTION_TYPES.SERVICE_ORDER,
  ];

  let isCredit = creditTypes.includes(type);
  let isDebit = debitTypes.includes(type);

  if (type === TRANSACTION_TYPES.BALANCE_ADJUSTMENT) {
    const direction = metadata?.direction;
    if (direction === 'credit') isCredit = true;
    else if (direction === 'debit') isDebit = true;
    else {
      throw new LedgerError(msg.BALANCE_ADJUSTMENT_DIRECTION);
    }
  }

  if (!isCredit && !isDebit) {
    throw new LedgerError(msg.UNSUPPORTED_USER_TX(type));
  }

  const run = async (session) => {
    const user = await User.findById(userId).session(session);
    if (!user || !user.isActive) {
      throw new LedgerError(msg.USER_NOT_FOUND_OR_INACTIVE, 'USER_NOT_FOUND');
    }

    const balanceBefore = user.balance;
    let balanceAfter;

    if (isCredit) {
      balanceAfter = addMoney(balanceBefore, moneyAmount);
    } else {
      if (moneyToNumber(balanceBefore) < moneyToNumber(moneyAmount)) {
        throw new LedgerError(msg.INSUFFICIENT_BALANCE, 'INSUFFICIENT_BALANCE');
      }
      balanceAfter = subtractMoney(balanceBefore, moneyAmount);
    }

    const updated = await User.findOneAndUpdate(
      { _id: userId, balanceVersion: user.balanceVersion },
      {
        $set: { balance: balanceAfter },
        $inc: { balanceVersion: 1 },
      },
      { new: true, session }
    );

    if (!updated) {
      throw new LedgerError(msg.BALANCE_VERSION_CONFLICT, 'VERSION_CONFLICT');
    }

    const [transaction] = await Transaction.create(
      [
        {
          type,
          status: TRANSACTION_STATUS.COMPLETED,
          currency: CURRENCIES.SYP,
          amount: moneyAmount,
          user: userId,
          performedBy,
          counterparty,
          balanceBefore,
          balanceAfter,
          description,
          metadata,
          idempotencyKey,
          order,
          balanceRequest,
        },
      ],
      { session }
    );

    return transaction;
  };

  if (externalSession) {
    return run(externalSession);
  }

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await run(session);
    });
    return result;
  } finally {
    session.endSession();
  }
}

/**
 * Atomically adjust an external provider's USD balance.
 */
export async function adjustProviderBalance({
  providerId,
  amount,
  type,
  performedBy,
  description = '',
  metadata = {},
  idempotencyKey = null,
  order = null,
  session: externalSession = null,
}) {
  if (idempotencyKey) {
    const existing = await Transaction.findOne({ idempotencyKey }).lean();
    if (existing) return existing;
  }

  const moneyAmount = toMoney(amount);
  const isDebit = type === TRANSACTION_TYPES.EXTERNAL_PROVIDER_DEBIT;
  const isCredit = type === TRANSACTION_TYPES.EXTERNAL_PROVIDER_CREDIT;

  if (!isDebit && !isCredit) {
    throw new LedgerError(msg.UNSUPPORTED_PROVIDER_TX(type));
  }

  const run = async (session) => {
    const provider = await ExternalProvider.findById(providerId).session(session);
    if (!provider || !provider.isActive) {
      throw new LedgerError(msg.PROVIDER_NOT_FOUND_OR_INACTIVE, 'PROVIDER_NOT_FOUND');
    }

    const balanceBefore = provider.balanceUSD;
    let balanceAfter;

    if (isCredit) {
      balanceAfter = addMoney(balanceBefore, moneyAmount);
    } else {
      if (moneyToNumber(balanceBefore) < moneyToNumber(moneyAmount)) {
        throw new LedgerError(msg.INSUFFICIENT_PROVIDER_BALANCE, 'INSUFFICIENT_PROVIDER_BALANCE');
      }
      balanceAfter = subtractMoney(balanceBefore, moneyAmount);
    }

    const updated = await ExternalProvider.findOneAndUpdate(
      { _id: providerId, balanceVersion: provider.balanceVersion },
      {
        $set: { balanceUSD: balanceAfter },
        $inc: { balanceVersion: 1 },
      },
      { new: true, session }
    );

    if (!updated) {
      throw new LedgerError(msg.PROVIDER_BALANCE_VERSION_CONFLICT, 'VERSION_CONFLICT');
    }

    const [transaction] = await Transaction.create(
      [
        {
          type,
          status: TRANSACTION_STATUS.COMPLETED,
          currency: provider.balanceCurrency || CURRENCIES.USD,
          amount: moneyAmount,
          externalProvider: providerId,
          performedBy,
          providerBalanceBefore: balanceBefore,
          providerBalanceAfter: balanceAfter,
          description,
          metadata,
          idempotencyKey: idempotencyKey ? `${idempotencyKey}:provider` : null,
          order,
        },
      ],
      { session }
    );

    return transaction;
  };

  if (externalSession) {
    return run(externalSession);
  }

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await run(session);
    });
    return result;
  } finally {
    session.endSession();
  }
}

export { LedgerError };
