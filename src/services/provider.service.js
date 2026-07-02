import { ExternalProvider } from '../models/ExternalProvider.js';
import { Service } from '../models/Service.js';
import { ExchangeRate } from '../models/ExchangeRate.js';
import { PROVIDER_TYPES, PRICING_TYPES, PROVIDER_DEFAULT_CURRENCY } from '../constants/index.js';
import { msg } from '../constants/messages.js';
import { encrypt } from '../utils/crypto.js';
import { createProviderClient } from '../providers/index.js';
import { toMoney, moneyToNumber } from '../utils/money.js';
import {
  isMtnOrSyriatelProduct,
  mapShehabiRequiredFields,
  resolveShehabiPricingType,
} from '../utils/shehabiProducts.js';

function mapTempoProduct(product) {
  const pricingType =
    product.product_type === 'amount' ? PRICING_TYPES.PER_UNIT : PRICING_TYPES.FIXED;

  let quantityRules = product.qty_values;
  if (quantityRules && typeof quantityRules === 'object' && !Array.isArray(quantityRules)) {
    quantityRules = {
      min: Number(quantityRules.min ?? 1),
      max: Number(quantityRules.max ?? quantityRules.min ?? 1),
    };
  }

  const requiredFields = (product.params || []).map((label, index) => ({
    key: index === 0 ? 'playerId' : `param${index}`,
    label,
    type: 'text',
  }));

  return {
    externalServiceId: String(product.id),
    name: product.name,
    description: product.category_name || '',
    category: product.category_name || '',
    categoryImage: product.category_img || '',
    parentId: String(product.parent_id || ''),
    costPriceUSD: toMoney(product.price ?? product.base_price ?? 0),
    pricingType,
    quantityRules,
    requiredFields,
    upstreamSnapshot: product,
    isActive: Boolean(product.available),
    available: Boolean(product.available),
  };
}

function mapShehabiProduct(product) {
  const pricingKind = resolveShehabiPricingType(product);

  return {
    externalServiceId: String(product.id),
    name: product.name,
    description: product.gameName || product.note || '',
    category: product.gameName || product.category_name || '',
    categoryImage: product.category_img || '',
    parentId: String(product.parent_id || ''),
    costPriceUSD: toMoney(product.price ?? 0),
    pricingType: pricingKind === 'fixed' ? PRICING_TYPES.FIXED : PRICING_TYPES.PER_UNIT,
    quantityRules: {
      min: Number(product.minCount ?? 1),
      max: Number(product.maxCount ?? 1),
    },
    requiredFields: mapShehabiRequiredFields(product),
    upstreamSnapshot: product,
    isActive: Boolean(product.isActive),
    available: Boolean(product.isActive),
  };
}

export async function listProviders() {
  return ExternalProvider.find().sort({ createdAt: 1 });
}

export async function getProviderById(id) {
  const provider = await ExternalProvider.findById(id);
  if (!provider) throw new Error(msg.PROVIDER_NOT_FOUND);
  return provider;
}

export async function createProvider({ name, providerType, websiteUrl, apiToken, notes }) {
  if (!Object.values(PROVIDER_TYPES).includes(providerType)) {
    throw new Error(msg.PROVIDER_INVALID_TYPE);
  }
  if (!apiToken) throw new Error(msg.API_TOKEN_REQUIRED);

  return ExternalProvider.create({
    name,
    providerType,
    websiteUrl,
    balanceCurrency: PROVIDER_DEFAULT_CURRENCY[providerType] || 'USD',
    credentials: encrypt(apiToken),
    notes,
  });
}

export async function updateProvider(id, updates) {
  const provider = await getProviderById(id);
  if (updates.name != null) provider.name = updates.name;
  if (updates.websiteUrl != null) provider.websiteUrl = updates.websiteUrl;
  if (updates.notes != null) provider.notes = updates.notes;
  if (updates.isActive != null) provider.isActive = updates.isActive;
  if (updates.apiToken) provider.credentials = encrypt(updates.apiToken);
  await provider.save();
  return provider;
}

export async function syncProviderBalance(providerId) {
  const provider = await getProviderById(providerId);
  const client = createProviderClient(provider);
  const profile = await client.getProfile();

  provider.balanceSYP = toMoney(profile.data.balance);
  provider.balanceUSD = toMoney(profile.data.balanceUSD);
  provider.lastSyncedAt = new Date();
  await provider.save();

  return provider;
}

export async function syncProviderProducts(providerId, { marginPercent = 0 } = {}) {
  const provider = await getProviderById(providerId);
  const client = createProviderClient(provider);
  const exchangeRate = await ExchangeRate.getActiveRate();
  const rawProducts = await client.getProducts();

  const isShehabi = provider.providerType === PROVIDER_TYPES.SHEHABI;
  const products = isShehabi
    ? rawProducts.filter(isMtnOrSyriatelProduct)
    : rawProducts;

  const mapper = isShehabi ? mapShehabiProduct : mapTempoProduct;
  const results = { created: 0, updated: 0, skipped: rawProducts.length - products.length, items: [] };
  const importedIds = [];

  for (const product of products) {
    const mapped = mapper(product);
    importedIds.push(mapped.externalServiceId);

    const cost = moneyToNumber(mapped.costPriceUSD);
    const isSypProvider = provider.balanceCurrency === 'SYP';
    const selling = isSypProvider
      ? cost * (1 + marginPercent / 100)
      : cost * exchangeRate.rate * (1 + marginPercent / 100);

    let service = await Service.findOne({
      externalProvider: provider._id,
      externalServiceId: mapped.externalServiceId,
    });

    if (service) {
      service.name = mapped.name;
      service.description = mapped.description;
      service.category = mapped.category;
      service.categoryImage = mapped.categoryImage;
      service.parentId = mapped.parentId;
      service.costPriceUSD = mapped.costPriceUSD;
      service.pricingType = mapped.pricingType;
      service.quantityRules = mapped.quantityRules;
      service.requiredFields = mapped.requiredFields;
      service.upstreamSnapshot = mapped.upstreamSnapshot;
      service.isActive = mapped.isActive;
      service.available = mapped.available;
      await service.save();
      results.updated += 1;
    } else {
      service = await Service.create({
        ...mapped,
        externalProvider: provider._id,
        sellingPriceSYP: toMoney(selling),
      });
      results.created += 1;
    }

    results.items.push(service);
  }

  if (isShehabi && importedIds.length > 0) {
    await Service.updateMany(
      { externalProvider: provider._id, externalServiceId: { $nin: importedIds } },
      { $set: { isActive: false } }
    );
  }

  return results;
}

export async function setProviderBalance(providerId, balanceUSD) {
  const provider = await getProviderById(providerId);
  provider.balanceUSD = toMoney(balanceUSD);
  provider.lastSyncedAt = new Date();
  await provider.save();
  return provider;
}
