/**
 * تصفية منتجات Shehabi — MTN و Syriatel فقط.
 * يشمل: وحدات، فواتير، كاش، جملة، روبوت، باقات، ADSL
 * يستبعد: بوبجي، فري فاير، مزودي الإنترنت، ألعاب أخرى...
 */
const MTN_SYRIATEL_PATTERN = /\b(MTN|Syriatel|سيريتل|سيرياتيل)\b/i;

export function isMtnOrSyriatelProduct(product) {
  const haystack = [product.gameName, product.name, product.note].filter(Boolean).join(' ');
  return MTN_SYRIATEL_PATTERN.test(haystack);
}

export function mapShehabiFieldType(field) {
  if (field.type === 'number') return 'number';
  if (field.type === 'select') return 'select';
  return 'text';
}

export function mapShehabiRequiredFields(product) {
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
