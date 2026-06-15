import mongoose from 'mongoose';
import {
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
  CURRENCIES,
} from '../constants/index.js';

/**
 * Immutable ledger entry for every financial movement.
 * Balances are never changed without a corresponding Transaction record.
 */
const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(TRANSACTION_TYPES),
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(TRANSACTION_STATUS),
      default: TRANSACTION_STATUS.COMPLETED,
      index: true,
    },
    currency: {
      type: String,
      enum: Object.values(CURRENCIES),
      required: true,
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: 0,
    },
    /** User whose balance changed (agent or admin) */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    /** Admin or agent who initiated the action */
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    /** Counterparty for transfers (e.g. admin when depositing to agent) */
    counterparty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    balanceBefore: {
      type: mongoose.Schema.Types.Decimal128,
    },
    balanceAfter: {
      type: mongoose.Schema.Types.Decimal128,
    },
    externalProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExternalProvider',
    },
    providerBalanceBefore: {
      type: mongoose.Schema.Types.Decimal128,
    },
    providerBalanceAfter: {
      type: mongoose.Schema.Types.Decimal128,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    balanceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BalanceRequest',
    },
    exchangeRate: {
      type: Number,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    /** Prevents duplicate processing of the same request */
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        for (const field of [
          'amount',
          'balanceBefore',
          'balanceAfter',
          'providerBalanceBefore',
          'providerBalanceAfter',
        ]) {
          if (ret[field]) {
            ret[field] = parseFloat(ret[field].toString());
          }
        }
        return ret;
      },
    },
  }
);

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ performedBy: 1, createdAt: -1 });
transactionSchema.index({ type: 1, createdAt: -1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);
