# دليل واجهة برمجة التطبيقات (API)

مرجع كامل لاستخدام جميع نقاط النهاية من تطبيق العميل (ويب / موبايل).

---

## معلومات عامة

| البند | القيمة |
|--------|--------|
| **الرابط الأساسي** | `http://localhost:3000/api` (أو حسب `PORT` في `.env`) |
| **تنسيق الطلبات** | `Content-Type: application/json` |
| **المصادقة** | `Authorization: Bearer <accessToken>` |
| **العملة للوكلاء والإدارة** | ليرة سورية (SYP) |
| **عملة المزوّدين الخارجيين** | Tempo: USD — Shehabi: SYP |

### الأدوار (Roles)

| الدور | القيمة | الوصف |
|-------|--------|--------|
| **عام** | — | لا يتطلب تسجيل دخول |
| **مصادق** | أي مستخدم مسجّل | admin أو agent |
| **وكيل** | `agent` | يشحن رصيده وينفّذ الطلبات |
| **مدير** | `admin` | يدير النظام بالكامل |

> **مهم:** لا يمكن إنشاء حساب مدير عبر `POST /auth/register`. التسجيل العام ينشئ **وكيلاً** فقط. المدير الأول يُنشأ تلقائياً عند تشغيل الخادم (انظر [إنشاء وإدارة المدير](#إنشاء-وإدارة-المدير)).

---

## شكل الاستجابة

### نجاح

```json
{
  "success": true,
  "data": { }
}
```

أو مع رسالة:

```json
{
  "success": true,
  "message": "تم بنجاح",
  "data": { }
}
```

### خطأ

**جميع رسائل الأخطاء بالعربية.**

```json
{
  "success": false,
  "message": "وصف الخطأ بالعربية"
}
```

| رمز HTTP | المعنى الشائع |
|----------|----------------|
| `400` | بيانات غير صالحة / رصيد غير كافٍ / قواعد العمل |
| `401` | غير مسجّل أو رمز منتهٍ |
| `403` | الدور غير مسموح |
| `404` | مسار أو مورد غير موجود |
| `409` | تعارض (مثل بريد مسجّل مسبقاً) |
| `429` | محاولات كثيرة (Rate limit) |
| `500` | خطأ داخلي |
| `502` | خطأ من المزوّد الخارجي (Tempo / Shehabi) |

---

## إنشاء وإدارة المدير

### 1) إعداد المتغيرات في `.env`

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me-strong-password
ADMIN_NAME=Owner
MONGODB_URI=mongodb://localhost:27017/sayed
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
```

### 2) تشغيل الخادم

عند أول تشغيل، إذا **لا يوجد** مستخدم بدور `admin`، يُنشأ تلقائياً من `ADMIN_EMAIL` و `ADMIN_PASSWORD` و `ADMIN_NAME`.

كما يُنشأ سعر صرف افتراضي `14000` (1 USD = 14,000 SYP) إن لم يكن موجوداً.

### 3) تسجيل دخول المدير

```http
POST /api/auth/login
```

```json
{
  "email": "admin@example.com",
  "password": "change-me-strong-password"
}
```

احفظ `accessToken` و `refreshToken` من الاستجابة.

### 4) سير عمل الإدارة الموصى به

1. **ضبط سعر الصرف** — `POST /api/admin/exchange-rate`
2. **إضافة/تحديث المزوّدين** — Tempo و Shehabi مع رموز API
3. **مزامنة رصيد المزوّد** — `POST /api/admin/providers/:id/sync-balance`
4. **مزامنة المنتجات** — `POST /api/admin/providers/:id/sync-products` (Shehabi: MTN و Syriatel فقط)
5. **تعديل أسعار البيع** — `PATCH /api/admin/services/:id`
6. **إنشاء وكلاء** — `POST /api/admin/agents`
7. **إيداع رصيد للوكيل** — `POST /api/admin/agents/:id/deposit` أو الموافقة على طلبات الشحن
8. **مراقبة الطلبات والحركات** — `/api/admin/orders` و `/api/admin/transactions`

### إنشاء وكلاء (ليس مديراً)

- **عام:** `POST /api/auth/register` — ينشئ وكيلاً
- **مدير:** `POST /api/admin/agents` — ينشئ وكيلاً بكلمة مرور

---

## كائنات JSON المشتركة

### User

```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "الاسم",
  "role": "admin | agent",
  "balance": 150000.5,
  "balanceVersion": 3,
  "authProviders": ["local"],
  "googleId": null,
  "isActive": true,
  "lastLoginAt": "2026-06-11T10:00:00.000Z",
  "createdAt": "...",
  "updatedAt": "..."
}
```

> `passwordHash` و `refreshTokens` لا تُرجَع أبداً في JSON.

### ExchangeRate

```json
{
  "id": "...",
  "rate": 14000,
  "isActive": true,
  "setBy": "...",
  "note": "ملاحظة",
  "effectiveFrom": "...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### ExternalProvider

```json
{
  "id": "...",
  "name": "Tempo",
  "providerType": "tempo | shehabi",
  "websiteUrl": "https://...",
  "balanceCurrency": "USD | SYP",
  "balanceUSD": 250.75,
  "balanceVersion": 1,
  "isActive": true,
  "lastSyncedAt": "...",
  "notes": "...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

> `credentials` (رمز API) لا يُرجَع في JSON.

### Service

```json
{
  "id": "...",
  "name": "1000 وحدة MTN",
  "description": "...",
  "externalProvider": { "id": "...", "name": "Shehabi", "providerType": "shehabi", "isActive": true },
  "externalServiceId": "123",
  "costPriceUSD": 5000,
  "sellingPriceSYP": 5500,
  "pricingType": "fixed | per_unit",
  "quantityRules": { "min": 1, "max": 10 },
  "requiredFields": [
    {
      "key": "phone",
      "label": "رقم الهاتف",
      "type": "text | number | phone | select",
      "placeholder": "",
      "helpText": "",
      "required": true,
      "options": [{ "value": "damascus", "label": "دمشق" }]
    }
  ],
  "category": "MTN",
  "sortOrder": 0,
  "isActive": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Order

```json
{
  "id": "...",
  "service": { "id": "...", "name": "..." },
  "externalProvider": { "id": "...", "name": "...", "providerType": "..." },
  "performedBy": { "id": "...", "name": "...", "email": "...", "role": "agent" },
  "status": "pending | processing | completed | failed | cancelled",
  "amountSYP": 5500,
  "costUSD": 5000,
  "exchangeRateAtOrder": 14000,
  "quantity": 1,
  "customerInput": { "phone": "0991234567" },
  "externalOrderUuid": "...",
  "externalOrderId": "...",
  "failureReason": null,
  "providerResponse": {},
  "createdAt": "...",
  "updatedAt": "..."
}
```

### BalanceRequest

```json
{
  "id": "...",
  "agent": { "id": "...", "name": "...", "email": "...", "balance": 0 },
  "amountSYP": 100000,
  "status": "pending | approved | rejected",
  "note": "طلب شحن",
  "reviewedBy": null,
  "reviewedAt": null,
  "rejectionReason": null,
  "transaction": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Transaction

```json
{
  "id": "...",
  "type": "agent_deposit | agent_withdraw | service_order | order_refund | balance_adjustment | external_provider_debit | external_provider_credit",
  "status": "pending | completed | failed | cancelled",
  "currency": "SYP | USD",
  "amount": 50000,
  "user": { "id": "...", "name": "...", "email": "...", "role": "agent" },
  "performedBy": { "id": "...", "name": "...", "email": "...", "role": "admin" },
  "counterparty": { "id": "...", "name": "...", "email": "..." },
  "balanceBefore": 0,
  "balanceAfter": 50000,
  "description": "إيداع من الإدارة",
  "order": null,
  "balanceRequest": null,
  "externalProvider": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Pagination

```json
{
  "items": [],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

(اسم الحقل يختلف: `agents`, `orders`, `requests`, `transactions`.)

---

## نقاط النهاية

### صحة الخادم

#### `GET /api/health`

| | |
|---|---|
| **من يستخدمه** | عام (بدون مصادقة) |
| **الطلب** | لا body |

**استجابة 200:**

```json
{
  "success": true,
  "message": "تم بنجاح"
}
```

---

## المصادقة — `/api/auth`

### `POST /api/auth/register`

| | |
|---|---|
| **من يستخدمه** | عام |
| **الوصف** | ينشئ حساب **وكيل** فقط |

**Body:**

```json
{
  "email": "agent@example.com",
  "name": "اسم الوكيل",
  "password": "password123"
}
```

| الحقل | مطلوب | القواعد |
|-------|--------|---------|
| `email` | نعم | بريد صالح |
| `name` | نعم | حرفان على الأقل |
| `password` | نعم | 8 أحرف على الأقل |

**استجابة 201:**

```json
{
  "success": true,
  "data": {
    "user": { /* User */ },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

**أخطاء شائعة:** `البريد الإلكتروني مسجل مسبقاً` — `409`

---

### `POST /api/auth/login`

| | |
|---|---|
| **من يستخدمه** | عام (admin أو agent) |

**Body:**

```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

**استجابة 200:** نفس شكل `register`.

**أخطاء:** `401` — `البريد الإلكتروني أو كلمة المرور غير صحيحة`، `الحساب معطّل`، `هذا الحساب يستخدم تسجيل الدخول عبر Google`

---

### `POST /api/auth/google`

| | |
|---|---|
| **من يستخدمه** | عام |
| **الوصف** | تسجيل/دخول عبر Google. مستخدم جديد = **وكيل** |

**Body:**

```json
{
  "idToken": "google-id-token-from-client-sdk"
}
```

**استجابة 200:** نفس شكل `register`.

**أخطاء:** `400` — `حقل idToken مطلوب` | `401` — `رمز Google غير صالح`، إلخ.

---

### `POST /api/auth/refresh`

| | |
|---|---|
| **من يستخدمه** | عام |

**Body:**

```json
{
  "refreshToken": "eyJ..."
}
```

**استجابة 200:**

```json
{
  "success": true,
  "data": {
    "user": { /* User */ },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

### `POST /api/auth/logout`

| | |
|---|---|
| **من يستخدمه** | عام (يُفضّل إرسال refresh token) |

**Body:**

```json
{
  "refreshToken": "eyJ..."
}
```

**استجابة 200:**

```json
{
  "success": true,
  "message": "تم تسجيل الخروج بنجاح"
}
```

---

### `GET /api/auth/me`

| | |
|---|---|
| **من يستخدمه** | مصادق (admin أو agent) |
| **Headers** | `Authorization: Bearer <accessToken>` |

**استجابة 200:**

```json
{
  "success": true,
  "data": {
    "user": { /* User */ }
  }
}
```

---

## مسارات المدير — `/api/admin`

> **جميع** المسارات التالية تتطلب: `Authorization: Bearer <accessToken>` + دور `admin`.

---

### الوكلاء

#### `GET /api/admin/agents`

**Query:** `page` (افتراضي 1)، `limit` (افتراضي 20)

**استجابة 200:**

```json
{
  "success": true,
  "data": {
    "agents": [ /* User[] */ ],
    "total": 5,
    "page": 1,
    "limit": 20
  }
}
```

---

#### `POST /api/admin/agents`

**Body:**

```json
{
  "email": "newagent@example.com",
  "name": "وكيل جديد",
  "password": "password123"
}
```

**استجابة 201:**

```json
{
  "success": true,
  "data": {
    "agent": { /* User */ }
  }
}
```

---

#### `PATCH /api/admin/agents/:id`

**Body (كل الحقول اختيارية):**

```json
{
  "name": "اسم محدّث",
  "isActive": false
}
```

**استجابة 200:**

```json
{
  "success": true,
  "data": { "agent": { /* User */ } }
}
```

---

#### `POST /api/admin/agents/:id/deposit`

**Body:**

```json
{
  "amount": 50000,
  "note": "إيداع أولي",
  "idempotencyKey": "unique-key-optional"
}
```

| الحقل | مطلوب |
|-------|--------|
| `amount` | نعم — رقم موجب (SYP) |
| `note` | لا |
| `idempotencyKey` | لا — يمنع التكرار |

**استجابة 201:**

```json
{
  "success": true,
  "data": { "transaction": { /* Transaction */ } }
}
```

---

#### `POST /api/admin/agents/:id/withdraw`

**Body:** نفس `deposit`.

**استجابة 201:** نفس الشكل. **خطأ:** `الرصيد غير كافٍ`

---

### طلبات شحن الرصيد

#### `GET /api/admin/balance-requests`

**Query:** `status` (`pending` | `approved` | `rejected`)، `page`، `limit`

**استجابة 200:**

```json
{
  "success": true,
  "data": {
    "requests": [ /* BalanceRequest[] */ ],
    "total": 10,
    "page": 1,
    "limit": 20
  }
}
```

---

#### `POST /api/admin/balance-requests/:id/approve`

**Body:**

```json
{
  "idempotencyKey": "optional"
}
```

**استجابة 200:**

```json
{
  "success": true,
  "data": { "request": { /* BalanceRequest */ } }
}
```

---

#### `POST /api/admin/balance-requests/:id/reject`

**Body:**

```json
{
  "reason": "سبب الرفض"
}
```

**استجابة 200:**

```json
{
  "success": true,
  "data": { "request": { /* BalanceRequest */ } }
}
```

---

### سعر الصرف

#### `GET /api/admin/exchange-rate`

**استجابة 200:**

```json
{
  "success": true,
  "data": { "rate": { /* ExchangeRate */ } }
}
```

---

#### `POST /api/admin/exchange-rate`

**Body:**

```json
{
  "rate": 14500,
  "note": "تحديث يومي"
}
```

| `rate` | مطلوب — أكبر من 0 (1 USD = rate SYP) |

**استجابة 201:**

```json
{
  "success": true,
  "data": { "rate": { /* ExchangeRate */ } }
}
```

---

#### `GET /api/admin/exchange-rates`

**استجابة 200:**

```json
{
  "success": true,
  "data": { "rates": [ /* ExchangeRate[] */ ] }
}
```

---

### المزوّدون الخارجيون

#### `GET /api/admin/providers`

**استجابة 200:**

```json
{
  "success": true,
  "data": { "providers": [ /* ExternalProvider[] */ ] }
}
```

---

#### `POST /api/admin/providers`

**Body:**

```json
{
  "name": "Tempo",
  "providerType": "tempo",
  "websiteUrl": "https://api.tempo-card.com",
  "apiToken": "your-api-token",
  "notes": "ملاحظات"
}
```

| `providerType` | `tempo` أو `shehabi` |
| `apiToken` | مطلوب |

**استجابة 201:**

```json
{
  "success": true,
  "data": { "provider": { /* ExternalProvider */ } }
}
```

---

#### `PATCH /api/admin/providers/:id`

**Body (اختياري):**

```json
{
  "name": "...",
  "websiteUrl": "...",
  "notes": "...",
  "isActive": true,
  "apiToken": "new-token-if-changing"
}
```

---

#### `POST /api/admin/providers/:id/sync-balance`

**Body:** لا شيء

**استجابة 200:**

```json
{
  "success": true,
  "data": { "provider": { /* ExternalProvider */ } }
}
```

---

#### `POST /api/admin/providers/:id/sync-products`

**Body:**

```json
{
  "marginPercent": 10
}
```

| `marginPercent` | اختياري — نسبة هامش على سعر البيع (افتراضي 0) |

**استجابة 200:**

```json
{
  "success": true,
  "data": {
    "created": 5,
    "updated": 12,
    "skipped": 80,
    "items": [ /* Service[] */ ]
  }
}
```

> **Shehabi:** يُستورد MTN و Syriatel فقط. المنتجات الأخرى تُحسب في `skipped`. المنتجات المحذوفة من المصدر تُعطّل (`isActive: false`).

---

### الخدمات (الكتalog)

#### `GET /api/admin/services`

**Query:** `providerId` (اختياري)

**استجابة 200:**

```json
{
  "success": true,
  "data": { "services": [ /* Service[] */ ] }
}
```

---

#### `POST /api/admin/services`

**Body:**

```json
{
  "name": "خدمة يدوية",
  "description": "...",
  "externalProvider": "provider-object-id",
  "externalServiceId": "123",
  "costPriceUSD": 10,
  "sellingPriceSYP": 150000,
  "pricingType": "fixed",
  "quantityRules": { "min": 1, "max": 1 },
  "requiredFields": [],
  "sortOrder": 0,
  "isActive": true
}
```

---

#### `PATCH /api/admin/services/:id`

**Body:** أي حقول من `createService` (اختيارية).

---

#### `DELETE /api/admin/services/:id`

**الوصف:** تعطيل الخدمة (`isActive: false`) — ليس حذفاً فعلياً.

**استجابة 200:**

```json
{
  "success": true,
  "data": { "service": { /* Service */ } }
}
```

---

### الحركات المالية

#### `GET /api/admin/transactions`

**Query:** `userId`، `type`، `page` (افتراضي 1)، `limit` (افتراضي 30)

**استجابة 200:**

```json
{
  "success": true,
  "data": {
    "transactions": [ /* Transaction[] */ ],
    "total": 100,
    "page": 1,
    "limit": 30
  }
}
```

---

### الطلبات

#### `GET /api/admin/orders`

**Query:** `agentId`، `status`، `page`، `limit`

**استجابة 200:**

```json
{
  "success": true,
  "data": {
    "orders": [ /* Order[] */ ],
    "total": 50,
    "page": 1,
    "limit": 20
  }
}
```

---

#### `POST /api/admin/orders`

| | |
|---|---|
| **من يستخدمه** | admin |
| **الوصف** | تنفيذ طلب خدمة (يُخصم من رصيد **المدير**) |

**Body:**

```json
{
  "serviceId": "service-object-id",
  "quantity": 1,
  "customerInput": {
    "phone": "0991234567",
    "playerId": "12345"
  },
  "idempotencyKey": "unique-order-key"
}
```

| الحقل | مطلوب |
|-------|--------|
| `serviceId` | نعم |
| `quantity` | لا (افتراضي 1) — حسب `quantityRules` |
| `customerInput` | حسب `requiredFields` للخدمة |
| `idempotencyKey` | لا |

**استجابة 201:**

```json
{
  "success": true,
  "data": { "order": { /* Order */ } }
}
```

**أخطاء:** `الخدمة غير موجودة أو غير مفعّلة`، `الرصيد غير كافٍ`، `الحقل مطلوب: ...`، `502` من المزوّد

---

#### `POST /api/admin/orders/:id/refresh`

**Body:** لا شيء — يحدّث حالة الطلب من المزوّد.

**استجابة 200:**

```json
{
  "success": true,
  "data": { "order": { /* Order */ } }
}
```

---

## مسارات الوكيل — `/api/agent`

> **جميع** المسارات تتطلب: `Authorization: Bearer <accessToken>` + دور `agent`.

---

### طلبات الشحن

#### `POST /api/agent/balance-requests`

**Body:**

```json
{
  "amount": 100000,
  "note": "طلب شحن رصيد"
}
```

**استجابة 201:**

```json
{
  "success": true,
  "data": { "request": { /* BalanceRequest */ } }
}
```

**أخطاء:** `لديك طلب شحن قيد الانتظار بالفعل`، `المبلغ يجب أن يكون أكبر من صفر`

---

#### `GET /api/agent/balance-requests`

**Query:** `status`، `page`، `limit`

**استجابة 200:** نفس شكل admin (طلبات الوكيل الحالي فقط).

---

### سعر الصرف

#### `GET /api/agent/exchange-rate`

**استجابة 200:**

```json
{
  "success": true,
  "data": { "rate": { /* ExchangeRate */ } }
}
```

---

### الخدمات

#### `GET /api/agent/services`

**الوصف:** الخدمات **النشطة** فقط.

**استجابة 200:**

```json
{
  "success": true,
  "data": { "services": [ /* Service[] */ ] }
}
```

---

### الطلبات

#### `POST /api/agent/orders`

**Body:** نفس `POST /api/admin/orders` — يُخصم من رصيد **الوكيل**.

**استجابة 201:** `{ "success": true, "data": { "order": { ... } } }`

---

#### `GET /api/agent/orders`

**Query:** `status`، `page`، `limit`

**استجابة 200:** طلبات الوكيل الحالي فقط.

---

#### `GET /api/agent/orders/:id`

**استجابة 200:**

```json
{
  "success": true,
  "data": { "order": { /* Order — تفاصيل كاملة */ } }
}
```

---

#### `POST /api/agent/orders/:id/refresh`

**استجابة 200:** `{ "success": true, "data": { "order": { ... } } }`

---

### الحركات المالية

#### `GET /api/agent/transactions`

**Query:** `type`، `page`، `limit`

**استجابة 200:** حركات الوكيل الحالي فقط.

---

## جدول ملخص الصلاحيات

| Endpoint | عام | agent | admin |
|----------|-----|-------|-------|
| `GET /health` | ✅ | ✅ | ✅ |
| `POST /auth/register` | ✅ | — | — |
| `POST /auth/login` | ✅ | ✅ | ✅ |
| `POST /auth/google` | ✅ | ✅ | ✅ |
| `POST /auth/refresh` | ✅ | ✅ | ✅ |
| `POST /auth/logout` | ✅ | ✅ | ✅ |
| `GET /auth/me` | — | ✅ | ✅ |
| `/admin/*` | — | ❌ | ✅ |
| `/agent/*` | — | ✅ | ❌ |

---

## أمثلة تدفق من العميل

### تسجيل وكيل وتنفيذ طلب

```javascript
// 1) تسجيل
const reg = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, name, password }),
}).then(r => r.json());

const token = reg.data.accessToken;

// 2) قائمة الخدمات
const services = await fetch('/api/agent/services', {
  headers: { Authorization: `Bearer ${token}` },
}).then(r => r.json());

// 3) طلب خدمة
const order = await fetch('/api/agent/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    serviceId: services.data.services[0].id,
    quantity: 1,
    customerInput: { phone: '0991234567' },
  }),
}).then(r => r.json());
```

### مدير يوافق على شحن

```javascript
await fetch(`/api/admin/balance-requests/${requestId}/approve`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`,
  },
  body: JSON.stringify({}),
});
```

---

## رسائل الأخطاء (مرجع)

جميع الرسائل التالية تُرجَع في حقل `message`:

| الرسالة |
|---------|
| حدث خطأ داخلي في الخادم |
| المسار غير موجود |
| غير مسموح لك بالوصول |
| يجب تسجيل الدخول أولاً |
| رمز الدخول غير صالح أو منتهي الصلاحية |
| محاولات كثيرة، يرجى المحاولة لاحقاً |
| البريد الإلكتروني مسجل مسبقاً |
| الرصيد غير كافٍ |
| الخدمة غير موجودة أو غير مفعّلة |
| … (انظر `src/constants/messages.js`) |

---

## ملاحظات للمطوّر

1. **`accessToken`** قصير العمر (افتراضي 15 دقيقة) — استخدم **`refreshToken`** لتجديده.
2. **`idempotencyKey`** مفيد لمنع تكرار الإيداع أو الطلب عند إعادة المحاولة.
3. **`customerInput`** مفاتيحه = `requiredFields[].key` لكل خدمة.
4. **`costPriceUSD`** للخدمات من Shehabi يحمل التكلفة بالليرة رغم اسم الحقل.
5. أخطاء Mongoose والمعرفات غير الصالحة: `بيانات غير صالحة` / `المعرف غير صالح`.
6. أخطاء المزوّد الخارجي: HTTP `502` مع رسالة عربية (أو رسالة عربية من المزوّد إن وُجدت).
