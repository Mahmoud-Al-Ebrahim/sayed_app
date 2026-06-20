import mongoose from 'mongoose';

const providerDepositSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ['shehabi', 'tempo'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    enum: ['SYP', 'USD'],
    required: true,
  },
  depositDate: {
    type: Date,
    required: true,
  },
  notes: {
    type: String,
  },
  depositedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

providerDepositSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

providerDepositSchema.index({ provider: 1, depositDate: -1 });
providerDepositSchema.index({ depositedBy: 1 });

export const ProviderDeposit = mongoose.model('ProviderDeposit', providerDepositSchema);
