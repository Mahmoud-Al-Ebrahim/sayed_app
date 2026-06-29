import { Service } from '../models/Service.js';
import { ProductProfit } from '../models/ProductProfit.js';
import { Badge } from '../models/Badge.js';
import { msg } from '../constants/messages.js';
import { toMoney } from '../utils/money.js';

export async function listServices({ activeOnly = false, providerId, includeBadgePrices = false } = {}) {
  const filter = {};
  if (activeOnly) filter.isActive = true;
  if (providerId) filter.externalProvider = providerId;

  const services = await Service.find(filter)
    .populate('externalProvider', 'name providerType isActive')
    .sort({ sortOrder: 1, name: 1 });

  if (!includeBadgePrices) {
    return services;
  }

  // Get all active badges
  const badges = await Badge.find({ isActive: true }).sort({ level: 1 });

  // Get all product profits for these services
  const serviceIds = services.map(s => s._id);
  const productProfits = await ProductProfit.find({
    externalProvider: { $in: services.map(s => s.externalProvider) },
    productId: { $in: services.map(s => s.externalServiceId) },
    badge: { $in: badges.map(b => b._id) },
  }).populate('badge', 'name displayName level');

  // Group profits by service
  const profitsByService = {};
  for (const profit of productProfits) {
    const key = `${profit.externalProvider}_${profit.productId}`;
    if (!profitsByService[key]) {
      profitsByService[key] = [];
    }
    profitsByService[key].push(profit);
  }

  // Attach badge prices to each service
  return services.map(service => {
    const serviceObj = service.toObject();
    const key = `${service.externalProvider}_${service.externalServiceId}`;
    const profits = profitsByService[key] || [];

    // Create badge prices array
    const badgePrices = badges.map(badge => {
      const profit = profits.find(p => p.badge._id.toString() === badge._id.toString());
      return {
        badgeId: badge._id,
        badgeName: badge.displayName,
        badgeLevel: badge.level,
        sellPriceSYP: profit?.sellPriceSYP || null,
        sellPriceUSD: profit?.sellPriceUSD || null,
        profitId: profit?.id || null,
      };
    });

    serviceObj.badgePrices = badgePrices;
    return serviceObj;
  });
}

export async function getServiceById(id) {
  const service = await Service.findById(id).populate(
    'externalProvider',
    'name providerType isActive'
  );
  if (!service) throw new Error(msg.SERVICE_NOT_FOUND);
  return service;
}

export async function createService(data) {
  return Service.create({
    name: data.name,
    description: data.description,
    externalProvider: data.externalProvider,
    externalServiceId: data.externalServiceId,
    costPriceUSD: toMoney(data.costPriceUSD),
    sellingPriceSYP: toMoney(data.sellingPriceSYP),
    pricingType: data.pricingType,
    quantityRules: data.quantityRules,
    requiredFields: data.requiredFields || [],
    sortOrder: data.sortOrder || 0,
    isActive: data.isActive ?? true,
  });
}

export async function updateService(id, data) {
  const service = await getServiceById(id);
  if (data.name != null) service.name = data.name;
  if (data.description != null) service.description = data.description;
  if (data.costPriceUSD != null) service.costPriceUSD = toMoney(data.costPriceUSD);
  if (data.sellingPriceSYP != null) service.sellingPriceSYP = toMoney(data.sellingPriceSYP);
  if (data.pricingType != null) service.pricingType = data.pricingType;
  if (data.quantityRules != null) service.quantityRules = data.quantityRules;
  if (data.requiredFields != null) service.requiredFields = data.requiredFields;
  if (data.sortOrder != null) service.sortOrder = data.sortOrder;
  if (data.isActive != null) service.isActive = data.isActive;
  await service.save();
  return service;
}

export async function deleteService(id) {
  const service = await getServiceById(id);
  service.isActive = false;
  await service.save();
  return service;
}
