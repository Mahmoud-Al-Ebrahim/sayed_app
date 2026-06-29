import mongoose from 'mongoose';
import { PROVIDER_TYPES } from '../constants/index.js';

/**
 * Product profit configuration per provider and badge
 * Stores the sell price for each product for each badge level
 * Profit is calculated as: sellPriceUSD - basePriceUSD
 */
const productProfitSchema = new mongoose.Schema(
  {
    externalProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExternalProvider',
      required: true,
      index: true,
    },
    providerType: {
      type: String,
      enum: Object.values(PROVIDER_TYPES),
      required: true,
      index: true,
    },
    productId: {
      type: String,
      required: true,
      index: true,
      comment: 'External product ID from provider (may be duplicated across providers)',
    },
    badge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge',
      required: true,
      index: true,
    },
    sellPriceUSD: {
      type: mongoose.Schema.Types.Decimal128,
      required: false,
      min: 0,
      comment: 'Sell price in USD for this product at this badge level (required for Tempo, optional for Shehabi)',
    },
    sellPriceSYP: {
      type: mongoose.Schema.Types.Decimal128,
      required: false,
      min: 0,
      comment: 'Sell price in SYP for this product at this badge level (required for Shehabi, optional for Tempo)',
    },
    isActive: {
      type: Boolean,
      default: true,
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
        if (ret.sellPriceUSD) {
          ret.sellPriceUSD = parseFloat(ret.sellPriceUSD.toString());
        }
        if (ret.sellPriceSYP) {
          ret.sellPriceSYP = parseFloat(ret.sellPriceSYP.toString());
        }
        return ret;
      },
    },
  }
);

// Compound index for unique combination
productProfitSchema.index(
  { externalProvider: 1, productId: 1, badge: 1 },
  { unique: true }
);

export const ProductProfit = mongoose.model('ProductProfit', productProfitSchema);
