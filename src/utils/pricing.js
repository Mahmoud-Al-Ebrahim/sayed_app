import { PRICING_TYPES } from '../constants/index.js';
import { moneyToNumber } from './money.js';

export function calculateOrderAmounts(service, quantity) {
  const unitCost = moneyToNumber(service.costPriceUSD);
  const unitSell = moneyToNumber(service.sellingPriceSYP);
  const qty = quantity || 1;

  if (service.pricingType === PRICING_TYPES.PER_UNIT) {
    return {
      amountSYP: Number((unitSell * qty).toFixed(2)),
      costUSD: Number((unitCost * qty).toFixed(4)),
    };
  }

  return {
    amountSYP: Number(unitSell.toFixed(2)),
    costUSD: Number(unitCost.toFixed(4)),
  };
}
