import { PROVIDER_TYPES } from '../constants/index.js';

/**
 * Service categories for order processing
 */
export const SERVICE_CATEGORY = {
  SHEHABI_UNITS: 'shehabi_units', // Units transfer (MTN, Syriatel, كازية, كاش)
  MAZWOD: 'mazwod', // مزود services (manual processing)
  TEMPO: 'tempo', // Other tempo services
};

/**
 * Categorize a service based on provider type and category name
 * @param {Object} serviceInfo - Service information from provider
 * @param {string} serviceInfo.provider - Provider type ('shehabi' or 'tempo')
 * @param {string} serviceInfo.category - Category name
 * @returns {string} Service category
 */
export function categorizeService({ provider, category }) {
  if (provider === PROVIDER_TYPES.SHEHABI) {
    // Category 1: Shehabi units transfer
    const shehabiUnitsPatterns = [
      'وحدات',
      'كازية',
      'كاش',
      'قسم الشام كاش',
      'قسم الارصدة',
      'SYRIATEL باقات',
    ];
    
    const isUnitsTransfer = shehabiUnitsPatterns.some(pattern => 
      category.includes(pattern)
    );
    
    return isUnitsTransfer ? SERVICE_CATEGORY.SHEHABI_UNITS : SERVICE_CATEGORY.MAZWOD;
  }
  
  if (provider === PROVIDER_TYPES.TEMPO) {
    // Category 2: مزود services
    if (category.startsWith('مزود')) {
      return SERVICE_CATEGORY.MAZWOD;
    }
    
    // Category 3: Other tempo services
    return SERVICE_CATEGORY.TEMPO;
  }
  
  // Default to tempo for unknown providers
  return SERVICE_CATEGORY.TEMPO;
}

/**
 * Check if a service category requires provider balance check
 * @param {string} category - Service category
 * @returns {boolean}
 */
export function requiresProviderBalanceCheck(category) {
  return category === SERVICE_CATEGORY.SHEHABI_UNITS || category === SERVICE_CATEGORY.TEMPO;
}

/**
 * Check if a service category requires manual processing (admin approval)
 * @param {string} category - Service category
 * @returns {boolean}
 */
export function requiresManualProcessing(category) {
  return category === SERVICE_CATEGORY.MAZWOD;
}
