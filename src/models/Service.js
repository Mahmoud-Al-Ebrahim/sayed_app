import mongoose from 'mongoose';
import { PRICING_TYPES } from '../constants/index.js';

/**
 * A resellable service mapped from an upstream provider.
 * costPriceUSD = what the owner pays upstream
 * sellingPriceSYP = what agents/admin charge customers (owner-defined)
 */
const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    externalProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExternalProvider',
      required: true,
      index: true,
    },
    /** Service identifier on the upstream platform */
    externalServiceId: {
      type: String,
      trim: true,
    },
    costPriceUSD: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: 0,
    },
    sellingPriceSYP: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: 0,
    },
    pricingType: {
      type: String,
      enum: Object.values(PRICING_TYPES),
      default: PRICING_TYPES.FIXED,
    },
    /** Upstream quantity rules (min/max, allowed values, etc.) */
    quantityRules: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    upstreamSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    /** حقول يجب على العميل إدخالها */
    requiredFields: [
      {
        key: { type: String, required: true, trim: true },
        label: { type: String, required: true, trim: true },
        type: {
          type: String,
          enum: ['text', 'number', 'phone', 'select'],
          default: 'text',
        },
        placeholder: { type: String, trim: true, default: '' },
        helpText: { type: String, trim: true, default: '' },
        required: { type: Boolean, default: true },
        options: [
          {
            value: { type: String, trim: true },
            label: { type: String, trim: true },
          },
        ],
      },
    ],
    /** تصنيف المنتج من Shehabi (مثل وحدات MTN) */
    category: {
      type: String,
      trim: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        if (ret.costPriceUSD) {
          ret.costPriceUSD = parseFloat(ret.costPriceUSD.toString());
        }
        if (ret.sellingPriceSYP) {
          ret.sellingPriceSYP = parseFloat(ret.sellingPriceSYP.toString());
        }
        return ret;
      },
    },
  }
);

serviceSchema.index({ externalProvider: 1, isActive: 1 });

export const Service = mongoose.model('Service', serviceSchema);
