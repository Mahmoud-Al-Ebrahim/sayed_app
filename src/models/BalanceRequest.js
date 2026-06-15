import mongoose from 'mongoose';
import { BALANCE_REQUEST_STATUS } from '../constants/index.js';

/**
 * Agent requests the admin to credit their SYP balance.
 */
const balanceRequestSchema = new mongoose.Schema(
  {
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amountSYP: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(BALANCE_REQUEST_STATUS),
      default: BALANCE_REQUEST_STATUS.PENDING,
      index: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    /** Linked ledger entry when approved */
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
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
        return ret;
      },
    },
  }
);

balanceRequestSchema.index({ agent: 1, status: 1, createdAt: -1 });

export const BalanceRequest = mongoose.model('BalanceRequest', balanceRequestSchema);
