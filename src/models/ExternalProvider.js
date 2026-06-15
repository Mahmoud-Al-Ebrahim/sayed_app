import mongoose from 'mongoose';
import { PROVIDER_TYPES, CURRENCIES } from '../constants/index.js';

/**
 * One of the owner's upstream websites (e.g. coin-charging platforms).
 * Balance is tracked in USD.
 */
const externalProviderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    providerType: {
      type: String,
      enum: Object.values(PROVIDER_TYPES),
      required: true,
      index: true,
    },
    websiteUrl: {
      type: String,
      trim: true,
    },
    /** Native currency of the upstream provider account */
    balanceCurrency: {
      type: String,
      enum: Object.values(CURRENCIES),
      default: CURRENCIES.USD,
    },
    /** Cached upstream balance in the provider's native currency */
    balanceUSD: {
      type: mongoose.Schema.Types.Decimal128,
      default: () => mongoose.Types.Decimal128.fromString('0.00'),
      min: 0,
    },
    balanceVersion: {
      type: Number,
      default: 0,
    },
    /** Encrypted credentials / API keys for upstream integration */
    credentials: {
      type: String,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastSyncedAt: Date,
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.credentials;
        if (ret.balanceUSD) {
          ret.balanceUSD = parseFloat(ret.balanceUSD.toString());
        }
        return ret;
      },
    },
  }
);

export const ExternalProvider = mongoose.model('ExternalProvider', externalProviderSchema);
