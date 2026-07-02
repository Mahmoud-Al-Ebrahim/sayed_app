import mongoose from 'mongoose';
import { msg } from '../constants/messages.js';

const { Decimal128 } = mongoose.Types;

/** Parse user/API input into a non-negative Decimal128 (2 decimal places). */
export function toMoney(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw new Error(msg.INVALID_MONEY);
  }
  return Decimal128.fromString(num.toFixed(2));
}

export function moneyToNumber(value) {
  if (value == null) return 0;
  return parseFloat(value.toString());
}

export function addMoney(a, b) {
  const sum = moneyToNumber(a) + moneyToNumber(b);
  return Decimal128.fromString(sum.toFixed(2));
}

export function subtractMoney(a, b) {
  const diff = moneyToNumber(a) - moneyToNumber(b);
  if (diff < 0) {
    throw new Error(msg.INSUFFICIENT_BALANCE);
  }
  return Decimal128.fromString(diff.toFixed(2));
}
