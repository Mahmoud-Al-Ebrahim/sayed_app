import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, AUTH_PROVIDERS } from '../constants/index.js';

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    authProviders: {
      type: [String],
      enum: Object.values(AUTH_PROVIDERS),
      default: [AUTH_PROVIDERS.LOCAL],
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      default: ROLES.AGENT,
      index: true,
    },
    /** Balance in Syrian Pounds (SYP) — admin and agents */
    balance: {
      type: mongoose.Schema.Types.Decimal128,
      default: () => mongoose.Types.Decimal128.fromString('0.00'),
      min: 0,
    },
    /** Optimistic locking — incremented on every balance change */
    balanceVersion: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    refreshTokens: {
      type: [refreshTokenSchema],
      select: false,
      default: [],
    },
    lastLoginAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        delete ret.refreshTokens;
        if (ret.balance) {
          ret.balance = parseFloat(ret.balance.toString());
        }
        return ret;
      },
    },
  }
);

userSchema.index({ role: 1, isActive: 1 });

userSchema.methods.setPassword = async function setPassword(plainPassword) {
  this.passwordHash = await bcrypt.hash(plainPassword, 12);
  if (!this.authProviders.includes(AUTH_PROVIDERS.LOCAL)) {
    this.authProviders.push(AUTH_PROVIDERS.LOCAL);
  }
};

userSchema.methods.comparePassword = async function comparePassword(plainPassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(plainPassword, this.passwordHash);
};

userSchema.statics.findByEmail = function findByEmail(email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

export const User = mongoose.model('User', userSchema);
