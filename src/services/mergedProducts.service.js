import { ExternalProvider } from '../models/ExternalProvider.js';
import { ProductProfit } from '../models/ProductProfit.js';
import { Badge } from '../models/Badge.js';
import { createProviderClient } from '../providers/index.js';
import { isTargetShehabiProduct, mapShehabiProduct } from '../utils/shehabiProducts.js';
import { msg } from '../constants/messages.js';

// Cache for products to ensure fast response
let productsCache = {
  shehabi: [],
  tempo: [],
  merged: [],
  lastUpdated: null,
  cacheDuration: 60 * 60 * 1000, // 1 hour
};

/**
 * Get merged products from both Shehabi and Tempo
 * Returns Shehabi products for target categories and Tempo products excluding duplicates
 * @param {Object} options - Options for fetching products
 * @param {boolean} options.includeProfits - Whether to include profit information
 * @param {string} options.userRole - User role ('admin' or 'client')
 * @param {ObjectId} options.userBadgeId - User's badge ID (required for client role)
 */
export async function getMergedProducts({ includeProfits = false, userRole = 'admin', userBadgeId = null } = {}) {
  const now = Date.now();
  
  // Return cached data if still valid
  if (productsCache.lastUpdated && (now - productsCache.lastUpdated) < productsCache.cacheDuration) {
    if (includeProfits) {
      return await addProfitsToProducts(productsCache.merged);
    }
    return productsCache.merged;
  }

  // Fetch fresh data
  const shehabiProvider = await ExternalProvider.findOne({
    providerType: 'shehabi',
    isActive: true,
  });

  const tempoProvider = await ExternalProvider.findOne({
    providerType: 'tempo',
    isActive: true,
  });

  if (!shehabiProvider || !tempoProvider) {
    throw new Error(msg.PROVIDER_NOT_ACTIVE);
  }

  try {
    // Fetch Shehabi products
    const shehabiClient = createProviderClient(shehabiProvider);
    const shehabiRawProducts = await shehabiClient.getProducts();
    
    // Filter and map Shehabi products (only target categories)
    const shehabiProducts = shehabiRawProducts
      .filter(isTargetShehabiProduct)
      .map(mapShehabiProduct);

    // Fetch Tempo products
    const tempoClient = createProviderClient(tempoProvider);
    const tempoRawProducts = await tempoClient.getProducts();

    // Create a Set of Shehabi product IDs to exclude from Tempo
    const shehabiProductIds = new Set(shehabiProducts.map(p => String(p.id)));

    // Map Tempo products, excluding duplicates
    const tempoProducts = tempoRawProducts
      .filter(product => !shehabiProductIds.has(String(product.id)))
      .map(product => {
        const pricingType = product.product_type === 'amount' ? 'per_unit' : 'fixed';
        let quantityRules = product.qty_values;
        if (quantityRules && typeof quantityRules === 'object' && !Array.isArray(quantityRules)) {
          quantityRules = {
            min: Number(quantityRules.min ?? 1),
            max: Number(quantityRules.max ?? quantityRules.min ?? 1),
          };
        }
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          basePrice: product.base_price,
          category: product.category_name,
          categoryImage: product.category_img,
          parentId: product.parent_id,
          available: product.available !== false,
          productType: product.product_type || 'package',
          params: product.params || [],
          quantityRules,
          pricingType,
          provider: 'tempo',
        };
      });

    // Merge products with provider source
    const mergedProducts = [
      ...shehabiProducts.map(p => ({ ...p, source: 'shehabi', providerId: shehabiProvider._id })),
      ...tempoProducts.map(p => ({ ...p, source: 'tempo', providerId: tempoProvider._id })),
    ];

    // Update cache
    productsCache = {
      shehabi: shehabiProducts,
      tempo: tempoProducts,
      merged: mergedProducts,
      lastUpdated: now,
      cacheDuration: productsCache.cacheDuration,
    };

    if (includeProfits) {
      return await addProfitsToProducts(mergedProducts, userRole, userBadgeId);
    }
    return mergedProducts;
  } catch (error) {
    // If fetch fails, return stale cache if available
    if (productsCache.merged.length > 0) {
      console.warn('Failed to fetch fresh products, returning stale cache:', error.message);
      if (includeProfits) {
        return await addProfitsToProducts(productsCache.merged, userRole, userBadgeId);
      }
      return productsCache.merged;
    }
    throw error;
  }
}

/**
 * Add sell price information to products based on user role
 * Admin: Returns all badges with sell prices
 * Client: Returns only the client's badge with sell price
 * @param {Array} products - Array of products
 * @param {string} userRole - User role ('admin' or 'client')
 * @param {ObjectId} userBadgeId - User's badge ID (required for client role)
 */
async function addProfitsToProducts(products, userRole = 'admin', userBadgeId = null) {
  const badges = await Badge.find({ isActive: true }).sort({ level: 1 });
  
  // For clients, get their specific badge
  let clientBadge = null;
  if (userRole === 'client' && userBadgeId) {
    clientBadge = await Badge.findById(userBadgeId);
  }
  
  const productsWithProfits = await Promise.all(
    products.map(async (product) => {
      const badgePrices = [];
      
      if (userRole === 'admin') {
        // Admin gets all badges with prices
        for (const badge of badges) {
          const profit = await ProductProfit.findOne({
            externalProvider: product.providerId,
            productId: String(product.id),
            badge: badge._id,
          });
          
          const priceData = {
            badgeId: badge._id,
            badgeName: badge.displayName,
            badgeLevel: badge.level,
          };
          
          if (product.source === 'tempo') {
            priceData.sellPriceUSD = profit && profit.sellPriceUSD ? parseFloat(profit.sellPriceUSD.toString()) : null;
          } else {
            priceData.sellPriceSYP = profit && profit.sellPriceSYP ? parseFloat(profit.sellPriceSYP.toString()) : null;
          }
          
          badgePrices.push(priceData);
        }
      } else if (userRole === 'client' && clientBadge) {
        // Client gets only their badge with price
        const profit = await ProductProfit.findOne({
          externalProvider: product.providerId,
          productId: String(product.id),
          badge: clientBadge._id,
        });
        
        const priceData = {
          badgeId: clientBadge._id,
          badgeName: clientBadge.displayName,
          badgeLevel: clientBadge.level,
        };
        
        if (product.source === 'tempo') {
          priceData.sellPriceUSD = profit && profit.sellPriceUSD ? parseFloat(profit.sellPriceUSD.toString()) : null;
        } else {
          priceData.sellPriceSYP = profit && profit.sellPriceSYP ? parseFloat(profit.sellPriceSYP.toString()) : null;
        }
        
        badgePrices.push(priceData);
      }
      
      return {
        ...product,
        badgePrices,
      };
    })
  );
  
  return productsWithProfits;
}

/**
 * Clear the products cache (call this after provider updates)
 */
export function clearProductsCache() {
  productsCache = {
    shehabi: [],
    tempo: [],
    merged: [],
    lastUpdated: null,
    cacheDuration: productsCache.cacheDuration,
  };
}

/**
 * Get Shehabi products only (for target categories)
 */
export async function getShehabiProducts() {
  const merged = await getMergedProducts();
  return merged.filter(p => p.source === 'shehabi');
}

/**
 * Get Tempo products only (excluding Shehabi duplicates)
 */
export async function getTempoProducts() {
  const merged = await getMergedProducts();
  return merged.filter(p => p.source === 'tempo');
}
