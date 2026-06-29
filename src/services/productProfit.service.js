import { ProductProfit } from '../models/ProductProfit.js';
import { ExternalProvider } from '../models/ExternalProvider.js';
import { Badge } from '../models/Badge.js';
import { msg } from '../constants/messages.js';

export async function setProductProfit({ providerId, productId, badgeId, sellPriceUSD, sellPriceSYP }) {
  const provider = await ExternalProvider.findById(providerId);
  if (!provider) throw new Error(msg.PROVIDER_NOT_FOUND);

  const badge = await Badge.findById(badgeId);
  if (!badge) throw new Error(msg.BADGE_NOT_FOUND);

  // Validate that the correct sell price is provided based on provider type
  if (provider.providerType === 'tempo' && sellPriceUSD == null) {
    throw new Error('sellPriceUSD is required for Tempo provider');
  }
  if (provider.providerType === 'shehabi' && sellPriceSYP == null) {
    throw new Error('sellPriceSYP is required for Shehabi provider');
  }

  // Upsert - create or update
  const updateData = {
    externalProvider: providerId,
    providerType: provider.providerType,
    productId,
    badge: badgeId,
  };

  if (sellPriceUSD != null) {
    updateData.sellPriceUSD = sellPriceUSD;
  }
  if (sellPriceSYP != null) {
    updateData.sellPriceSYP = sellPriceSYP;
  }

  const profit = await ProductProfit.findOneAndUpdate(
    {
      externalProvider: providerId,
      productId,
      badge: badgeId,
    },
    updateData,
    {
      upsert: true,
      new: true,
      runValidators: true,
    }
  ).populate('badge').populate('externalProvider');

  return profit;
}

export async function getProductProfit({ providerId, productId, badgeId }) {
  const profit = await ProductProfit.findOne({
    externalProvider: providerId,
    productId,
    badge: badgeId,
  })
    .populate('badge')
    .populate('externalProvider');

  return profit;
}

export async function listProductProfits({ providerId, badgeId, productId } = {}) {
  const filter = {};
  if (providerId) filter.externalProvider = providerId;
  if (badgeId) filter.badge = badgeId;
  if (productId) filter.productId = productId;

  const profits = await ProductProfit.find(filter)
    .populate('badge')
    .populate('externalProvider')
    .sort({ externalProvider: 1, productId: 1, badge: 1 });

  return profits;
}

export async function deleteProductProfit({ providerId, productId, badgeId }) {
  const profit = await ProductProfit.findOneAndDelete({
    externalProvider: providerId,
    productId,
    badge: badgeId,
  });

  if (!profit) throw new Error('Product profit configuration not found');

  return profit;
}

export async function batchSetProductProfits(profits) {
  // profits is an array of { providerId, productId, badgeId, sellPriceUSD, sellPriceSYP }
  const results = [];
  
  for (const profitData of profits) {
    try {
      const profit = await setProductProfit(profitData);
      results.push({ success: true, profit });
    } catch (error) {
      results.push({ success: false, error: error.message, data: profitData });
    }
  }

  return results;
}

export async function getSellPriceForOrder({ providerId, productId, badgeId, providerType }) {
  const profit = await ProductProfit.findOne({
    externalProvider: providerId,
    productId,
    badge: badgeId,
  });

  if (!profit) return 0;

  // Return the appropriate sell price based on provider type
  if (providerType === 'tempo') {
    return profit.sellPriceUSD ? parseFloat(profit.sellPriceUSD.toString()) : 0;
  } else if (providerType === 'shehabi') {
    return profit.sellPriceSYP ? parseFloat(profit.sellPriceSYP.toString()) : 0;
  }

  return 0;
}
