import mongoose from 'mongoose';
import { ORDER_STATUS, CURRENCIES } from '../constants/index.js';

/**
 * A service order placed by admin or agent on behalf of a customer.
 */
const orderSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
      index: true,
    },
    externalProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExternalProvider',
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true,
    },
    /** Amount charged from performer balance (SYP) */
    amountSYP: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: 0,
    },
    /** Cost debited from upstream provider (USD) */
    costUSD: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: 0,
    },
    exchangeRateAtOrder: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    externalOrderUuid: {
      type: String,
      trim: true,
      index: true,
    },
    providerResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    /** Customer-supplied data (phone, game ID, etc.) */
    customerInput: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    externalOrderId: {
      type: String,
      trim: true,
    },
    failureReason: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    /** Ledger entries: debit on place, credit on refund */
    debitTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    refundTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
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
        if (ret.amountSYP) {
          ret.amountSYP = parseFloat(ret.amountSYP.toString());
        }
        if (ret.costUSD) {
          ret.costUSD = parseFloat(ret.costUSD.toString());
        }
        return ret;
      },
    },
  }
);

orderSchema.index({ performedBy: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);
