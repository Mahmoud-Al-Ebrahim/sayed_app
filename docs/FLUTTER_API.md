# Flutter API Documentation

This documentation provides all the information needed to integrate the Sayed backend with a Flutter application.

## Base URL

```
http://localhost:3000
```

## Overview

The Sayed platform has two user roles:
- **Admin**: Full system access, manages users, providers, services, balances, and orders
- **Client**: Can place orders, view services, check profile, view transactions, and see available agents

## Authentication

All endpoints (except auth endpoints) require a JWT access token in the Authorization header:

```dart
headers: {
  'Authorization': 'Bearer $accessToken',
  'Content-Type': 'application/json',
}
```

### Authentication Flow

1. **Register** (optional - for new clients)
2. **Login** - Get access token and refresh token
3. **Use access token** for API calls (expires in 15 minutes)
4. **Refresh token** when access token expires

### Endpoints

#### Register

```http
POST /auth/register
Content-Type: application/json

{
  "email": "client@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "integerId": 2001,
      "email": "client@example.com",
      "name": "John Doe",
      "role": "client",
      "balance": 0.00
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "client@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "integerId": 2001,
      "email": "client@example.com",
      "name": "John Doe",
      "role": "client",
      "balance": 50000.00,
      "isBlocked": false,
      "badge": {
        "id": "badge_id",
        "name": "bronze",
        "displayName": "Bronze",
        "level": 0
      }
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

#### Google OAuth

```http
POST /auth/google
Content-Type: application/json

{
  "idToken": "google-oauth-id-token"
}
```

**Response:** Same as login

#### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token"
  }
}
```

---

## Client Endpoints

### Profile

#### Get Profile

```http
GET /client/profile
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "integerId": 2001,
      "email": "client@example.com",
      "name": "John Doe",
      "role": "client",
      "balance": 50000.00,
      "balanceVersion": 2,
      "isActive": true,
      "isBlocked": false,
      "badge": {
        "id": "badge_id",
        "name": "bronze",
        "displayName": "Bronze",
        "level": 0,
        "isActive": true
      },
      "lastLoginAt": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Orders

#### Place Order

**Important:** Orders are categorized into 3 types based on service category:

1. **Shehabi Units** (وحدات, كازية, كاش): Provider API called immediately
2. **مزود** (categories starting with "مزود"): No provider API, order set to "wait" status for admin approval
3. **Tempo** (other services): Provider API called immediately

```http
POST /client/orders
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "providerType": "shehabi", // or "tempo"
  "productId": "product_id_from_provider",
  "quantity": 1,
  "customerInput": {
    "phone": "0944123456"
  },
  "price": 10000, // Base price from provider (SYP for shehabi, USD for tempo)
  "category": "وحدات ام تي ان", // Service category for categorization
  "idempotencyKey": "unique-request-id" // Optional - prevents duplicates
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_id",
      "externalProvider": null, // Clients don't see provider info
      "performedBy": {
        "id": "user_id",
        "name": "John Doe",
        "role": "client"
      },
      "status": "wait", // or "pending", "processing", "completed", "failed", "cancelled"
      "amountSYP": 10600.00,
      "costUSD": 0.98,
      "profitUSD": 0.10,
      "quantity": 1,
      "customerInput": {
        "phone": "0944123456"
      },
      "userBalanceBefore": 50000.00,
      "userBalanceAfter": 39400.00,
      "providerBalanceBefore": null,
      "providerBalanceAfter": null,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Order Status Values:**
- `wait`: مزود category order awaiting admin approval
- `pending`: Order placed, processing
- `processing`: Order being processed
- `completed`: Order completed successfully
- `failed`: Order failed (includes rejected مزود orders)
- `cancelled`: Order cancelled

#### List Orders

```http
GET /client/orders?page=1&limit=20&status=wait&providerStatus=accept
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by internal status (pending, processing, completed, failed, cancelled, wait)
- `providerStatus`: Filter by provider status (accept, reject, wait, all)

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order_id",
        "performedBy": {
          "id": "user_id",
          "name": "John Doe",
          "role": "client"
        },
        "status": "completed",
        "amountSYP": 10600.00,
        "quantity": 1,
        "customerInput": {
          "phone": "0944123456"
        },
        "userBalanceBefore": 50000.00,
        "userBalanceAfter": 39400.00,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 20
  }
}
```

#### Get Order by ID

```http
GET /client/orders/:id
Authorization: Bearer <access_token>
```

**Response:** Same as single order in list response

#### Refresh Order Status

```http
POST /client/orders/:id/refresh
Authorization: Bearer <access_token>
```

**Response:** Updated order with current status

### Services

#### List Services (Merged Products)

```http
GET /client/services?includeProfits=true
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `includeProfits`: Include badge pricing information (default: false)

**Response for Client:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "product_id",
        "name": "MTN 100 Units",
        "source": "shehabi",
        "providerId": "provider_id",
        "category": "وحدات ام تي ان",
        "price": 10000,
        "basePrice": 9500,
        "categoryImage": "image_url",
        "parentId": "parent_id",
        "available": true,
        "productType": "package",
        "params": [],
        "quantityRules": {
          "min": 1,
          "max": 10
        },
        "pricingType": "fixed",
        "badgePrices": [
          {
            "badgeId": "badge_id",
            "badgeName": "Bronze",
            "badgeLevel": 0,
            "sellPriceSYP": 10500
          }
        ]
      }
    ]
  }
}
```

**Important Notes:**
- Clients only see pricing for their assigned badge
- For Shehabi products, `sellPriceSYP` is returned
- For Tempo products, `sellPriceUSD` is returned
- If no price is configured for the client's badge, the price field will be `null`

### Exchange Rate

#### Get Exchange Rate

```http
GET /client/exchange-rate
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rate": {
      "id": "rate_id",
      "rate": 10800.00,
      "isActive": true,
      "effectiveDate": "2024-01-16T00:00:00.000Z"
    }
  }
}
```

### Transactions

#### List Transactions

```http
GET /client/transactions?page=1&limit=30&type=service_order
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 30)
- `type`: Filter by transaction type

**Transaction Types:**
- `service_order`: Order placed
- `order_refund`: Order refunded
- `balance_adjustment`: Manual balance adjustment
- `client_deposit`: Deposit from admin
- `client_withdraw`: Withdrawal by admin

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "transaction_id",
        "type": "service_order",
        "currency": "SYP",
        "amount": 10600.00,
        "user": {
          "id": "user_id",
          "name": "John Doe"
        },
        "balanceBefore": 50000.00,
        "balanceAfter": 39400.00,
        "status": "completed",
        "description": "Service order order_id",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 30,
      "total": 50,
      "totalPages": 2
    }
  }
}
```

### Agents

#### List Agents

```http
GET /client/agents
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "agents": [
      {
        "id": "agent_id",
        "name": "Agent Name",
        "address": "123 Main St",
        "phone": "0944123456",
        "clientIntegerId": 2001,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

## Admin Endpoints

### Client Management

#### List Clients

```http
GET /admin/clients?page=1&limit=20&search=john
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search in name/email/phone

#### Get Client by Integer ID

```http
GET /admin/clients/:integerId
Authorization: Bearer <access_token>
```

#### Update Client Password

```http
PATCH /admin/clients/:integerId/password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "newPassword": "NewPassword123!"
}
```

#### Block Client

```http
PATCH /admin/clients/:integerId/block
Authorization: Bearer <access_token>
```

#### Unblock Client

```http
PATCH /admin/clients/:integerId/unblock
Authorization: Bearer <access_token>
```

#### Get Client Transactions

```http
GET /admin/clients/:integerId/transactions?page=1&limit=30
Authorization: Bearer <access_token>
```

#### Get Client Orders

```http
GET /admin/clients/:integerId/orders?page=1&limit=20&status=wait
Authorization: Bearer <access_token>
```

**Response:** Includes provider information and balance details

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order_id",
        "externalProvider": {
          "id": "provider_id",
          "name": "Tempo",
          "providerType": "tempo"
        },
        "performedBy": {
          "id": "client_id",
          "name": "Client Name",
          "role": "client"
        },
        "status": "wait",
        "amountSYP": 5000.00,
        "costUSD": 0.50,
        "quantity": 1,
        "customerInput": {
          "phone": "0944123456"
        },
        "userBalanceBefore": 50000.00,
        "userBalanceAfter": 45000.00,
        "providerBalanceBefore": 100.00,
        "providerBalanceAfter": 99.50,
        "rejectionNote": null,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 20
  }
}
```

#### Deposit to Client

```http
POST /admin/clients/:id/deposit
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 10000,
  "note": "Customer deposit"
}
```

#### Withdraw from Client

```http
POST /admin/clients/:id/withdraw
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 5000,
  "note": "Customer withdrawal"
}
```

### Order Management

#### List All Orders

```http
GET /admin/orders?page=1&limit=20&status=wait&userId=user_id
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by status
- `providerStatus`: Filter by provider status (accept, reject, wait, all)
- `userId`: Filter by specific user

#### List Wait Orders (مزود category)

```http
GET /admin/orders/wait?page=1&limit=20
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order_id",
        "externalProvider": {
          "id": "provider_id",
          "name": "Tempo",
          "providerType": "tempo"
        },
        "performedBy": {
          "id": "client_id",
          "name": "Client Name",
          "role": "client"
        },
        "status": "wait",
        "amountSYP": 5000.00,
        "costUSD": 0.50,
        "quantity": 1,
        "customerInput": {
          "phone": "0944123456"
        },
        "providerResponse": {
          "category": "mazwod"
        },
        "userBalanceBefore": 50000.00,
        "userBalanceAfter": 45000.00,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

#### Accept Wait Order

```http
POST /admin/orders/:orderId/accept
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_id",
      "status": "completed",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

#### Reject Wait Order

```http
POST /admin/orders/:orderId/reject
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "rejectionNote": "Service temporarily unavailable"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_id",
      "status": "failed",
      "rejectionNote": "Service temporarily unavailable",
      "refundTransaction": {
        "id": "refund_tx_id",
        "type": "order_refund",
        "amount": 5000.00
      },
      "refundBalanceBefore": 45000.00,
      "refundBalanceAfter": 50000.00,
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

### Agent Collection Management

#### List Agents

```http
GET /admin/agent-collection?page=1&limit=20&search=john
Authorization: Bearer <access_token>
```

#### Create Agent

```http
POST /admin/agent-collection
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Agent Name",
  "address": "123 Main St",
  "phone": "0944123456",
  "clientIntegerId": 2001
}
```

#### Get Agent

```http
GET /admin/agent-collection/:id
Authorization: Bearer <access_token>
```

#### Update Agent

```http
PATCH /admin/agent-collection/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "address": "New Address",
  "phone": "0944999999"
}
```

#### Delete Agent

```http
DELETE /admin/agent-collection/:id
Authorization: Bearer <access_token>
```

### Provider Management

#### List Providers

```http
GET /admin/providers?page=1&limit=20&providerType=shehabi&isActive=true
Authorization: Bearer <access_token>
```

#### Create Provider

```http
POST /admin/providers
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Provider Name",
  "providerType": "shehabi",
  "websiteUrl": "https://example.com",
  "apiKey": "api_key",
  "balanceSYP": 100000,
  "balanceUSD": 100
}
```

#### Update Provider

```http
PATCH /admin/providers/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "isActive": true
}
```

#### Sync Provider Balance

```http
POST /admin/providers/:id/sync-balance
Authorization: Bearer <access_token>
```

#### Sync Provider Products

```http
POST /admin/providers/:id/sync-products
Authorization: Bearer <access_token>
```

### Service Management

#### List Services (Merged Products)

```http
GET /admin/services?includeProfits=true
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `includeProfits`: Include badge pricing information (default: false)

**Response for Admin:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "product_id",
        "name": "MTN 100 Units",
        "source": "shehabi",
        "providerId": "provider_id",
        "category": "وحدات ام تي ان",
        "price": 10000,
        "basePrice": 9500,
        "categoryImage": "image_url",
        "parentId": "parent_id",
        "available": true,
        "productType": "package",
        "params": [],
        "quantityRules": {
          "min": 1,
          "max": 10
        },
        "pricingType": "fixed",
        "badgePrices": [
          {
            "badgeId": "bronze_badge_id",
            "badgeName": "Bronze",
            "badgeLevel": 0,
            "sellPriceSYP": 10500
          },
          {
            "badgeId": "silver_badge_id",
            "badgeName": "Silver",
            "badgeLevel": 1,
            "sellPriceSYP": 10300
          },
          {
            "badgeId": "gold_badge_id",
            "badgeName": "Gold",
            "badgeLevel": 2,
            "sellPriceSYP": 10100
          }
        ]
      }
    ]
  }
}
```

**Important Notes:**
- Admins see pricing for ALL badges
- For Shehabi products, `sellPriceSYP` is returned
- For Tempo products, `sellPriceUSD` is returned
- If no price is configured for a badge, the price field will be `null`

#### Create Service

```http
POST /admin/services
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "externalProviderId": "provider_id",
  "externalServiceId": "external_service_id",
  "name": "Service Name",
  "category": "Service Category",
  "sellingPriceSYP": 10000,
  "costPriceUSD": 0.90,
  "quantityRules": {
    "min": 1,
    "max": 10,
    "step": 1
  },
  "requiredFields": [
    {
      "key": "phone",
      "label": "Phone Number",
      "type": "text",
      "required": true
    }
  ],
  "isActive": true
}
```

#### Update Service

```http
PATCH /admin/services/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "isActive": false
}
```

#### Delete Service

```http
DELETE /admin/services/:id
Authorization: Bearer <access_token>
```

### Exchange Rate Management

#### Get Exchange Rate

```http
GET /admin/exchange-rate
Authorization: Bearer <access_token>
```

#### Set Exchange Rate

```http
POST /admin/exchange-rate
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "rate": 10800,
  "note": "Market update"
}
```

#### List Exchange Rates

```http
GET /admin/exchange-rates
Authorization: Bearer <access_token>
```

### Transactions

#### List All Transactions

```http
GET /admin/transactions?page=1&limit=30&userId=user_id&type=service_order
Authorization: Bearer <access_token>
```

### Badge Management

#### List Badges

```http
GET /admin/badges
Authorization: Bearer <access_token>
```

#### Create Badge

```http
POST /admin/badges
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "platinum",
  "profitMargin": 0.05,
  "description": "Platinum badge"
}
```

#### Update Badge

```http
PATCH /admin/badges/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "updated_name",
  "profitMargin": 0.10
}
```

#### Delete Badge

```http
DELETE /admin/badges/:id
Authorization: Bearer <access_token>
```

### Product Profit Management

#### List Product Profits

```http
GET /admin/product-profits?providerId=provider_id&badgeId=badge_id
Authorization: Bearer <access_token>
```

#### Set Product Profit

```http
POST /admin/product-profits
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "providerId": "provider_id",
  "productId": "product_id",
  "badgeId": "badge_id",
  "sellPrice": 10500
}
```

#### Delete Product Profit

```http
DELETE /admin/product-profits
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "providerId": "provider_id",
  "productId": "product_id",
  "badgeId": "badge_id"
}
```

#### Batch Set Product Profits

```http
POST /admin/product-profits/batch
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "providerId": "provider_id",
  "badgeId": "badge_id",
  "profits": [
    {
      "productId": "product_1",
      "sellPrice": 10500
    },
    {
      "productId": "product_2",
      "sellPrice": 10300
    }
  ]
}
```

### Merged Products

#### List Merged Products

```http
GET /admin/merged-products?includeProfits=true
Authorization: Bearer <access_token>
```

#### Refresh Products Cache

```http
POST /admin/merged-products/refresh
Authorization: Bearer <access_token>
```

### Provider Deposits

#### List Provider Deposits

```http
GET /admin/provider-deposits?page=1&limit=20&providerId=provider_id
Authorization: Bearer <access_token>
```

#### Create Provider Deposit

```http
POST /admin/provider-deposits
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "providerId": "provider_id",
  "amount": 100,
  "currency": "USD",
  "note": "Deposit to provider"
}
```

#### Get Provider Deposit

```http
GET /admin/provider-deposits/:id
Authorization: Bearer <access_token>
```

#### Delete Provider Deposit

```http
DELETE /admin/provider-deposits/:id
Authorization: Bearer <access_token>
```

---

## Error Handling

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions or blocked account)
- `404`: Not Found
- `500`: Internal Server Error

**Common Error Messages:**
- "Invalid user" - User not found or inactive
- "Your account has been blocked" - User is blocked
- "Service not found or inactive" - Service doesn't exist or is inactive
- "Provider not active" - Provider is not active
- "Insufficient balance" - User doesn't have enough balance
- "Insufficient provider balance" - Provider doesn't have enough balance
- "Order not found" - Order doesn't exist
- "Admins cannot place مزود category orders" - Admin trying to place مزود order
- "Field required" - Required field missing
- "Field invalid option" - Invalid select option

---

## Data Models

### User

```dart
class User {
  String id;
  int integerId;
  String email;
  String name;
  String role; // "admin" or "client"
  double balance;
  int balanceVersion;
  bool isActive;
  bool isBlocked;
  Badge? badge; // User's assigned badge
  DateTime? lastLoginAt;
  DateTime createdAt;
}

class Badge {
  String id;
  String name; // "bronze", "silver", "gold", etc.
  String displayName; // "Bronze", "Silver", "Gold", etc.
  String? description;
  int level; // Higher level = higher tier
  bool isActive;
  String? icon;
  String? color;
  DateTime createdAt;
  DateTime updatedAt;
}
```

### Order

```dart
class Order {
  String id;
  String? serviceId;
  String externalProviderId;
  String performedBy;
  String status; // "wait", "pending", "processing", "completed", "failed", "cancelled"
  double amountSYP;
  double costUSD;
  double profitUSD;
  String? badgeId;
  double exchangeRateAtOrder;
  int quantity;
  Map<String, dynamic> customerInput;
  String? externalOrderId;
  String? externalOrderUuid;
  Map<String, dynamic> providerResponse;
  String? failureReason;
  String? rejectionNote;
  String? debitTransactionId;
  String? refundTransactionId;
  DateTime createdAt;
  DateTime updatedAt;
  
  // Balance info (included in responses)
  double? userBalanceBefore;
  double? userBalanceAfter;
  double? providerBalanceBefore;
  double? providerBalanceAfter;
  double? refundBalanceBefore;
  double? refundBalanceAfter;
}
```

### Transaction

```dart
class Transaction {
  String id;
  String type; // "service_order", "order_refund", "balance_adjustment", "client_deposit", "client_withdraw"
  String status; // "pending", "completed", "failed", "cancelled"
  String currency; // "SYP" or "USD"
  double amount;
  String? userId;
  String performedBy;
  String? counterpartyId;
  double? balanceBefore;
  double? balanceAfter;
  String? externalProviderId;
  double? providerBalanceBefore;
  double? providerBalanceAfter;
  String? orderId;
  double? exchangeRate;
  String? description;
  Map<String, dynamic> metadata;
  DateTime createdAt;
}
```

### Service/Product

```dart
class Product {
  String id;
  String name;
  String source; // "shehabi" or "tempo"
  String providerId;
  String category;
  String? categoryImage;
  String? parentId;
  double price;
  double? basePrice;
  bool available;
  String productType; // "package" or "amount"
  List<dynamic> params;
  QuantityRules? quantityRules;
  String pricingType; // "fixed" or "per_unit"
  List<BadgePrice> badgePrices;
  DateTime createdAt;
  DateTime updatedAt;
}

class BadgePrice {
  String badgeId;
  String badgeName;
  int badgeLevel;
  double? sellPriceSYP; // For Shehabi products
  double? sellPriceUSD; // For Tempo products
}

class QuantityRules {
  int min;
  int max;
}

class RequiredField {
  String key;
  String label;
  String type; // "text", "number", "select"
  bool required;
  List<Option>? options; // For select type
}

class Option {
  String value;
  String label;
}
```

### Agent

```dart
class Agent {
  String id;
  String name;
  String address;
  String phone;
  int clientIntegerId;
  DateTime createdAt;
  DateTime updatedAt;
}
```

### ExternalProvider

```dart
class ExternalProvider {
  String id;
  String name;
  String providerType; // "shehabi" or "tempo"
  String websiteUrl;
  bool isActive;
  double balanceSYP;
  double balanceUSD;
  DateTime createdAt;
  DateTime updatedAt;
}
```

### Badge

```dart
class Badge {
  String id;
  String name; // "bronze", "silver", "gold", etc.
  double profitMargin;
  String? description;
  DateTime createdAt;
  DateTime updatedAt;
}
```

---

## Service Categorization Logic

Services are automatically categorized based on provider type and category name:

### Shehabi Units Transfer (Category 1)
- **Provider**: shehabi
- **Category patterns**: وحدات, كازية, كاش, قسم الشام كاش, قسم الارصدة, SYRIATEL باقات
- **Behavior**: 
  - Checks admin shehabi balance before placing order
  - Calls provider API immediately
  - Order status based on provider response
  - Client balance deducted

### مزود Services (Category 2)
- **Provider**: shehabi or tempo
- **Category pattern**: starts with "مزود"
- **Behavior**:
  - No provider API call
  - Client balance deducted immediately
  - Order status set to "wait"
  - Admin must manually accept/reject
  - If rejected: client refunded with rejection note
  - **Admins cannot place these orders**

### Tempo Services (Category 3)
- **Provider**: tempo
- **Category**: anything not matching مزود pattern
- **Behavior**:
  - Checks admin tempo balance before placing order
  - Calls provider API immediately
  - Order status based on provider response
  - Client balance deducted

---

## Flutter Implementation Tips

### 1. Token Management

Store tokens securely using flutter_secure_storage:

```dart
final storage = FlutterSecureStorage();

// Save tokens
await storage.write(key: 'accessToken', value: accessToken);
await storage.write(key: 'refreshToken', value: refreshToken);

// Get tokens
final accessToken = await storage.read(key: 'accessToken');
final refreshToken = await storage.read(key: 'refreshToken');
```

### 2. API Client

Use dio for HTTP requests with interceptors for token management:

```dart
final dio = Dio(BaseOptions(
  baseUrl: 'http://localhost:3000',
));

// Add token interceptor
dio.interceptors.add(InterceptorsWrapper(
  onRequest: (options, handler) async {
    final token = await storage.read(key: 'accessToken');
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  },
  onError: (error, handler) async {
    if (error.response?.statusCode == 401) {
      // Refresh token
      final refreshToken = await storage.read(key: 'refreshToken');
      final response = await dio.post('/auth/refresh', data: {
        'refreshToken': refreshToken,
      });
      
      final newAccessToken = response.data['data']['accessToken'];
      await storage.write(key: 'accessToken', value: newAccessToken);
      
      // Retry original request
      final opts = error.requestOptions;
      opts.headers['Authorization'] = 'Bearer $newAccessToken';
      return dio.fetch(opts);
    }
    handler.next(error);
  },
));
```

### 3. Pagination

Implement pagination with infinite scroll or load more buttons:

```dart
class PaginatedResponse<T> {
  final List<T> data;
  final int total;
  final int page;
  final int limit;
  final int totalPages;
  
  PaginatedResponse({
    required this.data,
    required this.total,
    required this.page,
    required this.limit,
    required this.totalPages,
  });
  
  factory PaginatedResponse.fromJson(Map<String, dynamic> json, T Function(Map<String, dynamic>) fromJsonT) {
    final data = (json['data']['orders'] ?? json['data']['transactions'] ?? json['data']['agents'] ?? []) as List;
    return PaginatedResponse(
      data: data.map((e) => fromJsonT(e)).toList(),
      total: json['pagination']?['total'] ?? json['total'] ?? 0,
      page: json['pagination']?['page'] ?? json['page'] ?? 1,
      limit: json['pagination']?['limit'] ?? json['limit'] ?? 20,
      totalPages: json['pagination']?['totalPages'] ?? 1,
    );
  }
}
```

### 4. Error Handling

Create a unified error handler:

```dart
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  
  ApiException(this.message, [this.statusCode]);
  
  @override
  String toString() => message;
}

void handleApiError(DioException error) {
  if (error.response != null) {
    final data = error.response!.data;
    if (data is Map && data.containsKey('message')) {
      throw ApiException(data['message'], error.response!.statusCode);
    }
  }
  throw ApiException('Network error occurred');
}
```

### 5. Order Status Display

Create status widgets with appropriate colors:

```dart
Widget buildOrderStatus(String status) {
  final colors = {
    'wait': Colors.orange,
    'pending': Colors.blue,
    'processing': Colors.purple,
    'completed': Colors.green,
    'failed': Colors.red,
    'cancelled': Colors.grey,
  };
  
  final labels = {
    'wait': 'Waiting',
    'pending': 'Pending',
    'processing': 'Processing',
    'completed': 'Completed',
    'failed': 'Failed',
    'cancelled': 'Cancelled',
  };
  
  return Container(
    padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
    decoration: BoxDecoration(
      color: colors[status]?.withOpacity(0.1),
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: colors[status] ?? Colors.grey),
    ),
    child: Text(
      labels[status] ?? status,
      style: TextStyle(
        color: colors[status],
        fontWeight: FontWeight.bold,
      ),
    ),
  );
}
```

### 6. Balance Formatting

Format currency values:

```dart
String formatCurrency(double amount, String currency) {
  if (currency == 'USD') {
    return '\$${amount.toStringAsFixed(2)}';
  }
  return '${amount.toStringAsFixed(0)} SYP';
}

String formatBalanceChange(double before, double after) {
  final change = after - before;
  if (change > 0) {
    return '+${formatCurrency(change, 'SYP')}';
  } else if (change < 0) {
    return '${formatCurrency(change, 'SYP')}';
  }
  return 'No change';
}
```

---

## Testing

Use the base URL `http://localhost:3000` for local development. Ensure your Flutter app can connect to the backend (may need to use `10.0.2.2` for Android emulator or your machine's IP for physical devices).

---

## Support

For questions or issues, refer to the backend team or check the API documentation in the `docs` folder.
