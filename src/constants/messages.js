/** رسائل الأخطاء والاستجابات بالعربية */
export const msg = {
  // عام
  INTERNAL_ERROR: 'حدث خطأ داخلي في الخادم',
  ROUTE_NOT_FOUND: 'المسار غير موجود',
  OK: 'تم بنجاح',
  FORBIDDEN: 'غير مسموح لك بالوصول',
  DUPLICATE: 'البيانات مسجلة مسبقاً',
  VALIDATION_FAILED: 'بيانات غير صالحة',
  INVALID_ID: 'المعرف غير صالح',

  // المصادقة
  AUTH_REQUIRED: 'يجب تسجيل الدخول أولاً',
  INVALID_TOKEN: 'رمز الدخول غير صالح أو منتهي الصلاحية',
  INVALID_USER: 'المستخدم غير صالح أو غير نشط',
  TOO_MANY_ATTEMPTS: 'محاولات كثيرة، يرجى المحاولة لاحقاً',
  ID_TOKEN_REQUIRED: 'حقل idToken مطلوب',
  LOGGED_OUT: 'تم تسجيل الخروج بنجاح',

  EMAIL_REQUIRED: 'البريد الإلكتروني غير صالح',
  NAME_REQUIRED: 'الاسم يجب أن يكون حرفين على الأقل',
  PASSWORD_MIN: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
  EMAIL_EXISTS: 'البريد الإلكتروني مسجل مسبقاً',
  ACCOUNT_DEACTIVATED: 'الحساب معطّل',
  INVALID_CREDENTIALS: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  USE_GOOGLE_SIGNIN: 'هذا الحساب يستخدم تسجيل الدخول عبر Google',
  REFRESH_TOKEN_REQUIRED: 'رمز التحديث مطلوب',
  INVALID_REFRESH_TOKEN: 'رمز التحديث غير صالح أو منتهي الصلاحية',
  USER_NOT_FOUND: 'المستخدم غير موجود',
  REFRESH_TOKEN_REVOKED: 'رمز التحديث ملغى أو منتهي الصلاحية',

  GOOGLE_TOKEN_REQUIRED: 'رمز Google مطلوب',
  GOOGLE_TOKEN_INVALID: 'رمز Google غير صالح',
  GOOGLE_EMAIL_REQUIRED: 'حساب Google يجب أن يحتوي على بريد إلكتروني',
  GOOGLE_EMAIL_NOT_VERIFIED: 'البريد الإلكتروني في Google غير موثّق',

  // الوكلاء
  AGENT_NOT_FOUND: 'الوكيل غير موجود',
  AGENT_NOT_FOUND_OR_INACTIVE: 'الوكيل غير موجود أو غير نشط',

  // المزوّدون
  PROVIDER_NOT_FOUND: 'المزوّد غير موجود',
  PROVIDER_INVALID_TYPE: 'نوع المزوّد غير صالح',
  API_TOKEN_REQUIRED: 'رمز API مطلوب',
  PROVIDER_NO_TOKEN: (name) => `لا يوجد رمز API للمزوّد ${name}`,
  PROVIDER_UNSUPPORTED_TYPE: (type) => `نوع المزوّد غير مدعوم: ${type}`,
  PROVIDER_HTTP_ERROR: (status) => `خطأ من المزوّد (${status})`,
  TEMPO_TOKEN_REQUIRED: 'رمز Tempo مطلوب',
  TEMPO_ORDER_FAILED: 'فشل إنشاء الطلب على Tempo',
  TEMPO_CHECK_FAILED: 'فشل التحقق من طلبات Tempo',
  SHEHABI_TOKEN_REQUIRED: 'رمز Shehabi مطلوب',
  SHEHABI_BALANCE_FAILED: 'فشل جلب الرصيد من Shehabi',
  SHEHABI_PRODUCTS_FAILED: 'فشل جلب المنتجات من Shehabi',
  SHEHABI_ORDER_FAILED: 'فشل إنشاء الطلب على Shehabi',
  SHEHABI_CHECK_FAILED: 'فشل التحقق من طلبات Shehabi',

  // سعر الصرف
  EXCHANGE_RATE_INVALID: 'سعر الصرف يجب أن يكون أكبر من صفر',
  EXCHANGE_RATE_NOT_SET: 'لم يتم ضبط سعر الصرف',

  // الخدمات والطلبات
  SERVICE_NOT_FOUND: 'الخدمة غير موجودة',
  SERVICE_NOT_FOUND_OR_INACTIVE: 'الخدمة غير موجودة أو غير مفعّلة',
  PROVIDER_NOT_ACTIVE: 'مزوّد الخدمة غير نشط',
  ORDER_NOT_FOUND: 'الطلب غير موجود',
  ORDER_NO_EXTERNAL_REF: 'الطلب لا يحتوي على مرجع خارجي بعد',

  // طلبات الشحن
  BALANCE_REQUEST_AMOUNT_INVALID: 'المبلغ يجب أن يكون أكبر من صفر',
  BALANCE_REQUEST_PENDING_EXISTS: 'لديك طلب شحن قيد الانتظار بالفعل',
  BALANCE_REQUEST_NOT_FOUND: 'طلب الشحن غير موجود',
  BALANCE_REQUEST_NOT_PENDING: 'طلب الشحن ليس قيد الانتظار',

  // الأموال والكميات
  INVALID_MONEY: 'مبلغ غير صالح',
  INSUFFICIENT_BALANCE: 'الرصيد غير كافٍ',
  QUANTITY_POSITIVE: 'الكمية يجب أن تكون رقماً صحيحاً موجباً',
  QUANTITY_MUST_BE_ONE: 'الكمية يجب أن تكون 1 لهذه الخدمة',
  QUANTITY_ONE_OF: (allowed) => `الكمية يجب أن تكون واحدة من: ${allowed.join('، ')}`,
  QUANTITY_BETWEEN: (min, max) => `الكمية يجب أن تكون بين ${min} و ${max}`,
  FIELD_REQUIRED: (label) => `الحقل مطلوب: ${label}`,
  FIELD_INVALID_OPTION: (label) => `قيمة غير صالحة للحقل: ${label}`,

  // دفتر الحسابات
  BALANCE_ADJUSTMENT_DIRECTION: 'تعديل الرصيد يتطلب تحديد الاتجاه (إضافة أو خصم)',
  UNSUPPORTED_USER_TX: (type) => `نوع حركة غير مدعوم: ${type}`,
  UNSUPPORTED_PROVIDER_TX: (type) => `نوع حركة مزوّد غير مدعوم: ${type}`,
  USER_NOT_FOUND_OR_INACTIVE: 'المستخدم غير موجود أو غير نشط',
  PROVIDER_NOT_FOUND_OR_INACTIVE: 'المزوّد غير موجود أو غير نشط',
  INSUFFICIENT_PROVIDER_BALANCE: 'رصيد المزوّد غير كافٍ',
  BALANCE_VERSION_CONFLICT: 'تعارض في تحديث الرصيد، يرجى إعادة المحاولة',
  PROVIDER_BALANCE_VERSION_CONFLICT: 'تعارض في تحديث رصيد المزوّد، يرجى إعادة المحاولة',
};
