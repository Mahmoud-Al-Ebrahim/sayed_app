import mongoose from 'mongoose';
import { msg } from '../constants/messages.js';

/**
 * USD → SYP conversion rate.
 * Only one record should have isActive=true at a time.
 * Example: rate = 14000 means 1 USD = 14,000 SYP
 */
const exchangeRateSchema = new mongoose.Schema(
  {
    rate: {
      type: Number,
      required: true,
      min: 0.01,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    setBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    effectiveFrom: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

exchangeRateSchema.index({ isActive: 1, effectiveFrom: -1 });

exchangeRateSchema.statics.getActiveRate = async function getActiveRate() {
  const record = await this.findOne({ isActive: true }).sort({ effectiveFrom: -1 });
  if (!record) {
    throw new Error(msg.EXCHANGE_RATE_NOT_SET);
  }
  return record;
};

export const ExchangeRate = mongoose.model('ExchangeRate', exchangeRateSchema);
