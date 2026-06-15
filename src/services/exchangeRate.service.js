import { ExchangeRate } from '../models/ExchangeRate.js';
import { msg } from '../constants/messages.js';

export async function getActiveRate() {
  return ExchangeRate.getActiveRate();
}

export async function setExchangeRate({ rate, setBy, note }) {
  if (!rate || rate <= 0) throw new Error(msg.EXCHANGE_RATE_INVALID);

  await ExchangeRate.updateMany({ isActive: true }, { $set: { isActive: false } });

  return ExchangeRate.create({
    rate,
    isActive: true,
    setBy,
    note,
  });
}

export async function listExchangeRates({ limit = 20 } = {}) {
  return ExchangeRate.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('setBy', 'name email');
}
