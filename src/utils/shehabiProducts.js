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

  if (qtyValues) {
    if (Array.isArray(qtyValues)) {
      // specificPackage type
      allowedValues = qtyValues;
      pricingType = 'specific_package';
    } else {
      minQty = Number(qtyValues.min) || 1;
      maxQty = Number(qtyValues.max) || 1;
      if (minQty !== 1 || maxQty !== 1) {
        pricingType = product.product_type === 'amount' ? 'per_unit' : 'fixed';
      }
    }
  }

  return {
    id: product.id,
    name: product.name,
    price: product.price,
    category: product.category_name,
    available: product.available,
    productType: product.product_type,
    parentId: product.parent_id,
    basePrice: product.base_price,
    categoryImg: product.category_img,
    params: product.params || [],
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
