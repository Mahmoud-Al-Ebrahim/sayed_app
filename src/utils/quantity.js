import { msg } from '../constants/messages.js';

export function validateQuantity(quantity, rules) {
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1) {
    throw new Error(msg.QUANTITY_POSITIVE);
  }

  if (!rules) {
    if (qty !== 1) throw new Error(msg.QUANTITY_MUST_BE_ONE);
    return qty;
  }

  if (Array.isArray(rules)) {
    const allowed = rules.map(String);
    if (!allowed.includes(String(qty))) {
      throw new Error(msg.QUANTITY_ONE_OF(allowed));
    }
    return qty;
  }

  if (rules.min != null || rules.max != null) {
    const min = Number(rules.min ?? 1);
    const max = Number(rules.max ?? min);
    if (qty < min || qty > max) {
      throw new Error(msg.QUANTITY_BETWEEN(min, max));
    }
    return qty;
  }

  return qty;
}
