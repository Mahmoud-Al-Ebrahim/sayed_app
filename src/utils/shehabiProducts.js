/**
 * تصفية منتجات Shehabi — MTN و Syriatel فقط.
 * يشمل: وحدات، فواتير، كاش، جملة، روبوت، باقات، ADSL
 * يستبعد: بوبجي، فري فاير، مزودي الإنترنت، ألعاب أخرى...
 * 
 * Updated for new Shehabi response format:
 * - Products now have: id, name, price, params, category_name, available, qty_values, product_type, parent_id, base_price, category_img
 */
const TARGET_CATEGORIES = [
  'وحدات ام تي ان',
  'وحدات سيريتيل',
  'وحدات فواتير كاش MTN',
  'وحدات فواتير كاش SYRISTEL',
  'كاش SYRIATEL',
  'MTN كاش',
  'تعبئة كازية سيرتيل',
  'جملة وحدات سيريتيل SYRIATEL',
  'وحدات MTN باقات (ربط شهابي)',
  'MTN فواتير',
  'مزود خدمة الانترنت (سوا)',
  'مزود خدمة الإنترنت (سما نت)',
  'مزود الانترنت (آية)',
];

const TARGET_KEYWORDS = [
  'mtn',
  'syriatel',
  'سيريتل',
  'سيرياتيل',
  'ام تي ان',
  'كازية',
  'كاش',
  'مزود وحدات',
];

export function isTargetShehabiProduct(product) {
  const categoryName = product.category_name || '';
  const name = product.name || '';

  // Check if category name matches
  for (const cat of TARGET_CATEGORIES) {
    if (categoryName.includes(cat)) return true;
  }

  // Check if name contains target keywords
  const haystack = (categoryName + ' ' + name).toLowerCase();
  for (const keyword of TARGET_KEYWORDS) {
    if (haystack.includes(keyword.toLowerCase())) return true;
  }

  return false;
}

export function mapShehabiProduct(product) {
  const qtyValues = product.qty_values;
  let minQty = 1;
  let maxQty = 1;
  let pricingType = 'fixed';
  let allowedValues = null;
  let quantityRules = null;

  if (qtyValues) {
    if (Array.isArray(qtyValues)) {
      // specificPackage type
      allowedValues = qtyValues;
      pricingType = 'specific_package';
    } else {
      minQty = Number(qtyValues.min) || 1;
      maxQty = Number(qtyValues.max) || 1;
      quantityRules = {
        min: minQty,
        max: maxQty,
      };
      if (minQty !== 1 || maxQty !== 1) {
        pricingType = product.product_type === 'amount' ? 'per_unit' : 'fixed';
      }
    }
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
    productType: product.product_type,
    params: product.params || [],
    quantityRules,
    minQty,
    maxQty,
    pricingType,
    allowedValues,
    provider: 'shehabi',
  };
}

export function mapShehabiFieldType(field) {
  if (field.type === 'number') return 'number';
  if (field.type === 'select') return 'select';
  return 'text';
}

export function mapShehabiRequiredFields(product) {
  // New format: params is an array of strings (parameter descriptions)
  // Old format: daynamicFields was an array of objects
  if (Array.isArray(product.params) && product.params.length > 0) {
    return product.params.map((param, index) => ({
      key: `param_${index}`,
      label: param,
      type: 'text',
      placeholder: param,
      required: true,
    }));
  }

  // Fallback for old format
  return (product.daynamicFields || []).map((field) => {
    const mapped = {
      key: field.name,
      label: field.label || field.name,
      type: mapShehabiFieldType(field),
      placeholder: field.placeholder || '',
      helpText: field.help_text || '',
      required: field.required !== false,
    };

    if (field.type === 'select' && Array.isArray(field.options)) {
      mapped.options = field.options.map((opt) => ({
        value: String(opt.value ?? opt.label),
        label: String(opt.label ?? opt.value),
      }));
    }

    return mapped;
  });
}

export function resolveShehabiPricingType(product) {
  const min = Number(product.minCount ?? 1);
  const max = Number(product.maxCount ?? 1);
  return min === 1 && max === 1 ? 'fixed' : 'per_unit';
}

// MTN categories to detect
const MTN_CATEGORIES = [
  10, 12, 15, 20, 25, 30, 35, 40, 50, 60, 70, 85, 90, 100, 110, 150, 170, 190, 200, 230, 260, 280, 300, 320, 340, 360, 400, 420, 440, 460, 480, 500, 550, 600, 650, 700, 750, 1000, 1500, 2000, 2500, 3000, 3500, 3600, 4500, 4800, 5000, 5500, 6000, 7200,
];

// Syriatel categories to detect
const SYRIATEL_CATEGORIES = [
  192, 288, 384, 480, 576, 961, 2019, 2307, 2403, 2596, 3076, 4038, 4519, 4807, 5288, 6250, 6826, 7211, 7788, 8173, 8653, 9615, 10096, 10576, 11538, 13076, 14423, 16057, 16346, 17307, 18365, 19230, 21153, 24038, 28846, 31730, 37019, 43269, 48076, 57692, 72115, 76923, 95192, 105769, 192307, 211538, 240384, 384615,
];

// Special product IDs
const SPECIAL_PRODUCTS = {
  CASH_SYRIATEL: 3858,
  CASH_MTN: 4888,
  BILLS_MTN: 4879,
  BILLS_SYRIATEL: 3835,
  WHOLESALE_SYRIATEL: 3858, // Same as cash syriatel
  WHOLESALE_MTN: null, // Not available yet
};

/**
 * Check if a product is an MTN or Syriatel product based on category detection
 * @param {Object} product - The product object from Shehabi API
 * @returns {boolean} - True if product matches MTN or Syriatel categories
 */
export function isMtnOrSyriatelProduct(product) {
  const name = (product.name || '').replace(/\s+/g, '');
  const categoryName = (product.category_name || '').toLowerCase();
  const id = product.id;

  // Check for special products by ID
  if (id === SPECIAL_PRODUCTS.CASH_SYRIATEL || id === SPECIAL_PRODUCTS.CASH_MTN ||
      id === SPECIAL_PRODUCTS.BILLS_MTN || id === SPECIAL_PRODUCTS.BILLS_SYRIATEL) {
    return true;
  }

  // Check category names for MTN/Syriatel keywords
  if (categoryName.includes('mtn') || categoryName.includes('syriatel') ||
      categoryName.includes('سيريتل') || categoryName.includes('ام تي ان')) {
    return true;
  }

  // Check for MTN categories (e.g., "MTN12" or "12MTN")
  for (const cat of MTN_CATEGORIES) {
    const mtnPattern1 = `MTN${cat}`;
    const mtnPattern2 = `${cat}MTN`;
    if (name.includes(mtnPattern1) || name.includes(mtnPattern2)) {
      return true;
    }
  }

  // Check for Syriatel categories (e.g., "SYRIATEL4.8" for 480, "SYRIATEL173.07" for 17307)
  for (const cat of SYRIATEL_CATEGORIES) {
    // Convert to decimal format for matching
    const decimalValue = cat / 100;
    const syriatelPattern1 = `SYRIATEL${decimalValue}`;
    const syriatelPattern2 = `SYRIATEL${cat}`;
    if (name.includes(syriatelPattern1) || name.includes(syriatelPattern2)) {
      return true;
    }
  }

  // Check for كاش (cash) and فواتير (bills) and كازية (wholesale)
  if (name.includes('كاش') || name.includes('فاتورة') || name.includes('كازية') ||
      categoryName.includes('كاش') || categoryName.includes('فواتير') || categoryName.includes('كازية')) {
    return true;
  }

  return false;
}

/**
 * Get the product type (cash, bills, wholesale, or regular)
 * @param {Object} product - The product object from Shehabi API
 * @returns {string} - Product type
 */
export function getShehabiProductType(product) {
  const name = (product.name || '').toLowerCase();
  const categoryName = (product.category_name || '').toLowerCase();
  const id = product.id;

  if (id === SPECIAL_PRODUCTS.CASH_SYRIATEL || id === SPECIAL_PRODUCTS.CASH_MTN ||
      categoryName.includes('كاش') || name.includes('كاش')) {
    return 'cash';
  }

  if (id === SPECIAL_PRODUCTS.BILLS_MTN || id === SPECIAL_PRODUCTS.BILLS_SYRIATEL ||
      categoryName.includes('فواتير') || name.includes('فاتورة')) {
    return 'bills';
  }

  if (id === SPECIAL_PRODUCTS.WHOLESALE_SYRIATEL ||
      categoryName.includes('جملة') || name.includes('كازية')) {
    return 'wholesale';
  }

  return 'regular';
}
