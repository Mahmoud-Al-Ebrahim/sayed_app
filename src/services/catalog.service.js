import { Service } from '../models/Service.js';
import { msg } from '../constants/messages.js';
import { toMoney } from '../utils/money.js';

export async function listServices({ activeOnly = false, providerId } = {}) {
  const filter = {};
  if (activeOnly) filter.isActive = true;
  if (providerId) filter.externalProvider = providerId;

  return Service.find(filter)
    .populate('externalProvider', 'name providerType isActive')
    .sort({ sortOrder: 1, name: 1 });
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
