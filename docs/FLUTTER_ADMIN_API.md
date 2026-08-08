# Flutter Admin API Documentation

Complete API documentation for the Admin role in the Sayed backend system for Flutter application integration.

## Base URL

```
http://localhost:3000
```

## Authentication

All admin endpoints require JWT authentication. Include the access token in the Authorization header:

```dart
headers: {
  'Authorization': 'Bearer $accessToken',
  'Content-Type': 'application/json',
}
```

---

## 1. Authentication & Profile Management

### 1.1 Admin Login

Authenticate as admin and receive access/refresh tokens.

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@sayed.com",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "admin_id",
      "integerId": 1,
      "email": "admin@sayed.com",
      "name": "Admin Name",
      "role": "admin",
      "balance": 0.00,
      "isActive": true,
      "isBlocked": false,
      "lastLoginAt": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### 1.2 Google OAuth Login

```http
POST /auth/google
Content-Type: application/json

{
  "idToken": "google-oauth-id-token"
}
```

**Response:** Same as login

### 1.3 Refresh Access Token

Access tokens expire after 15 minutes. Use this to get a new one.

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
    "user": {
      "id": "admin_id",
      "integerId": 1,
      "email": "admin@sayed.com",
      "name": "Admin Name",
      "role": "admin"
    },
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token"
  }
}
```

### 1.4 Get Admin Profile

Get current admin profile information.

```http
GET /auth/me
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "admin_id",
      "integerId": 1,
      "email": "admin@sayed.com",
      "name": "Admin Name",
      "role": "admin",
      "balance": 0.00,
      "isActive": true,
      "lastLoginAt": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 1.5 Get Admin Profile by Integer ID

```http
GET /auth/profile/:integerId
Authorization: Bearer <access_token>
```

**Response:** Same as above

---

## 2. Provider Balance Management

### 2.1 List All Providers

Get all external providers (Tempo, Shehabi) with their current balances.

```http
GET /admin/providers
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "providers": [
      {
        "id": "provider_id",
        "name": "Shehabi",
        "providerType": "shehabi",
        "websiteUrl": "https://shehabi.com",
        "balanceCurrency": "SYP",
        "balanceSYP": 150000.00,
        "balanceUSD": 0.00,
        "balanceVersion": 5,
        "isActive": true,
        "apiKey": "masked_key",
        "lastSyncAt": "2024-01-15T10:30:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": "provider_id_2",
        "name": "Tempo",
        "providerType": "tempo",
        "websiteUrl": "https://tempo.com",
        "balanceCurrency": "USD",
        "balanceSYP": 0.00,
        "balanceUSD": 500.00,
        "balanceVersion": 3,
        "isActive": true,
        "apiKey": "masked_key",
        "lastSyncAt": "2024-01-15T10:30:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 2.2 Sync Provider Balance

Refresh the balance for a specific provider from their API.

```http
POST /admin/providers/:id/sync-balance
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `id`: Provider ID

**Response:**
```json
{
  "success": true,
  "data": {
    "provider": {
      "id": "provider_id",
      "name": "Shehabi",
      "providerType": "shehabi",
      "balanceSYP": 145000.00,
      "balanceUSD": 0.00,
      "balanceVersion": 6,
      "lastSyncAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

### 2.3 Create Provider

```http
POST /admin/providers
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "New Provider",
  "providerType": "shehabi",
  "websiteUrl": "https://provider.com",
  "balanceCurrency": "SYP",
  "apiKey": "provider_api_key",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "provider": {
      "id": "new_provider_id",
      "name": "New Provider",
      "providerType": "shehabi",
      "balanceSYP": 0.00,
      "isActive": true,
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

### 2.4 Update Provider

```http
PATCH /admin/providers/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Updated Provider Name",
  "apiKey": "new_api_key",
  "isActive": false
}
```

**Response:** Similar to create provider

---

## 3. Services & Badge Pricing Management

### 3.1 Get All Services (Merged Products)

Get all services from both providers with badge pricing information.

```http
GET /admin/services?includeProfits=true
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `includeProfits`: Set to `true` to include badge pricing information

**Response:**
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
          },
          {
            "badgeId": "badge_id_2",
            "badgeName": "Silver",
            "badgeLevel": 1,
            "sellPriceSYP": 10300
          },
          {
            "badgeId": "badge_id_3",
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

**Service Types:**
- **tempo**: Services from Tempo provider
- **shehabi**: Services from Shehabi provider (وحدات, كازية, كاش)
- **mazwod**: Services with category starting with "مزود"

### 3.2 Create Service

```http
POST /admin/services
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "New Service",
  "providerId": "provider_id",
  "category": "service_category",
  "price": 10000,
  "available": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "service": {
      "id": "service_id",
      "name": "New Service",
      "providerId": "provider_id",
      "category": "service_category",
      "price": 10000,
      "available": true,
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

### 3.3 Update Service

```http
PATCH /admin/services/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Updated Service Name",
  "price": 12000,
  "available": false
}
```

**Response:** Similar to create service

### 3.4 Delete Service

```http
DELETE /admin/services/:id
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "service": {
      "id": "service_id",
      "name": "Deleted Service"
    }
  }
}
```

### 3.5 Sync Provider Products

Sync products from a provider's API to the local database.

```http
POST /admin/providers/:id/sync-products
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "marginPercent": 10
}
```

**Path Parameters:**
- `id`: Provider ID

**Request Body:**
- `marginPercent`: Optional margin percentage to add to base prices

**Response:**
```json
{
  "success": true,
  "data": {
    "synced": 25,
    "updated": 10,
    "created": 15,
    "failed": 0
  }
}
```

### 3.6 List Badges

Get all available badges in the system.

```http
GET /admin/badges
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `activeOnly`: Set to `true` to get only active badges

**Response:**
```json
{
  "success": true,
  "data": {
    "badges": [
      {
        "id": "badge_id",
        "name": "bronze",
        "displayName": "Bronze",
        "level": 0,
        "isActive": true,
        "description": "Basic badge",
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": "badge_id_2",
        "name": "silver",
        "displayName": "Silver",
        "level": 1,
        "isActive": true,
        "description": "Intermediate badge",
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": "badge_id_3",
        "name": "gold",
        "displayName": "Gold",
        "level": 2,
        "isActive": true,
        "description": "Premium badge",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 3.7 Create Badge

```http
POST /admin/badges
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "platinum",
  "displayName": "Platinum",
  "level": 3,
  "isActive": true,
  "description": "VIP badge"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "badge": {
      "id": "badge_id",
      "name": "platinum",
      "displayName": "Platinum",
      "level": 3,
      "isActive": true,
      "description": "VIP badge",
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

### 3.8 Update Badge

```http
PATCH /admin/badges/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "displayName": "Updated Platinum",
  "isActive": false
}
```

**Response:** Similar to create badge

### 3.9 Delete Badge

```http
DELETE /admin/badges/:id
Authorization: Bearer <access_token>
```

**Response:** Similar to delete service

### 3.10 Set Product Profit (Badge Pricing)

Set sell price for a specific product and badge combination.

```http
POST /admin/product-profits
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "providerId": "provider_id",
  "productId": "product_id",
  "badgeId": "badge_id",
  "sellPriceUSD": 1.50,
  "sellPriceSYP": 15000
}
```

**Request Body:**
- `providerId`: Provider ID
- `productId`: Product ID from provider
- `badgeId`: Badge ID
- `sellPriceUSD`: Sell price in USD (for Tempo products)
- `sellPriceSYP`: Sell price in SYP (for Shehabi products)

**Response:**
```json
{
  "success": true,
  "data": {
    "profit": {
      "id": "profit_id",
      "providerId": "provider_id",
      "productId": "product_id",
      "badgeId": "badge_id",
      "sellPriceUSD": 1.50,
      "sellPriceSYP": 15000,
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

### 3.11 List Product Profits

Get all product profit settings.

```http
GET /admin/product-profits
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `providerId`: Filter by provider ID
- `badgeId`: Filter by badge ID
- `productId`: Filter by product ID

**Response:**
```json
{
  "success": true,
  "data": {
    "profits": [
      {
        "id": "profit_id",
        "providerId": "provider_id",
        "productId": "product_id",
        "badgeId": "badge_id",
        "sellPriceUSD": 1.50,
        "sellPriceSYP": 15000,
        "createdAt": "2024-01-15T11:00:00.000Z"
      }
    ]
  }
}
```

### 3.12 Delete Product Profit

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

**Response:**
```json
{
  "success": true,
  "data": {
    "profit": {
      "id": "profit_id"
    }
  }
}
```

### 3.13 Batch Set Product Profits

Set multiple product profits at once.

```http
POST /admin/product-profits/batch
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "profits": [
    {
      "providerId": "provider_id",
      "productId": "product_id_1",
      "badgeId": "badge_id",
      "sellPriceUSD": 1.50,
      "sellPriceSYP": 15000
    },
    {
      "providerId": "provider_id",
      "productId": "product_id_2",
      "badgeId": "badge_id",
      "sellPriceUSD": 2.00,
      "sellPriceSYP": 20000
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "success": true,
        "profit": { "id": "profit_id_1" }
      },
      {
        "success": true,
        "profit": { "id": "profit_id_2" }
      }
    ]
  }
}
```

---

## 4. Exchange Rate Management

### 4.1 Get Current Exchange Rate

Get the active USD to SYP exchange rate.

```http
GET /admin/exchange-rate
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rate": {
      "id": "rate_id",
      "rate": 12500,
      "isActive": true,
      "setBy": {
        "id": "admin_id",
        "name": "Admin Name"
      },
      "note": "Daily rate update",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

### 4.2 Set Exchange Rate

Set a new exchange rate.

```http
POST /admin/exchange-rate
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "rate": 13000,
  "note": "Market rate update"
}
```

**Request Body:**
- `rate`: Exchange rate (1 USD = X SYP)
- `note`: Optional note describing the rate change

**Response:**
```json
{
  "success": true,
  "data": {
    "rate": {
      "id": "rate_id",
      "rate": 13000,
      "isActive": true,
      "setBy": {
        "id": "admin_id",
        "name": "Admin Name"
      },
      "note": "Market rate update",
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

### 4.3 List Exchange Rate History

Get historical exchange rates.

```http
GET /admin/exchange-rates
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rates": [
      {
        "id": "rate_id",
        "rate": 13000,
        "isActive": true,
        "setBy": {
          "id": "admin_id",
          "name": "Admin Name"
        },
        "note": "Market rate update",
        "createdAt": "2024-01-15T11:00:00.000Z"
      },
      {
        "id": "rate_id_2",
        "rate": 12500,
        "isActive": false,
        "setBy": {
          "id": "admin_id",
          "name": "Admin Name"
        },
        "note": "Previous rate",
        "createdAt": "2024-01-14T10:00:00.000Z"
      }
    ]
  }
}
```

---

## 5. Agent Management

### 5.1 List Agents

Get all agents in the system.

```http
GET /admin/agent-collection
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search in name/phone

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
    ],
    "total": 10,
    "page": 1,
    "limit": 20
  }
}
```

### 5.2 Create Agent

Create a new agent linked to an existing client.

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

**Request Body:**
- `name`: Agent full name
- `address`: Agent address
- `phone`: Agent phone number
- `clientIntegerId`: Unique integer ID of existing client

**Response:**
```json
{
  "success": true,
  "data": {
    "agent": {
      "id": "agent_id",
      "name": "Agent Name",
      "address": "123 Main St",
      "phone": "0944123456",
      "clientIntegerId": 2001,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 5.3 Get Agent by ID

```http
GET /admin/agent-collection/:id
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `id`: Agent ID

**Response:** Same as single agent in list response

### 5.4 Update Agent

```http
PATCH /admin/agent-collection/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "address": "456 New St",
  "phone": "0944987654",
  "clientIntegerId": 2002
}
```

**Response:** Similar to create agent

### 5.5 Delete Agent

```http
DELETE /admin/agent-collection/:id
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "agent": {
      "id": "agent_id",
      "name": "Agent Name"
    }
  }
}
```

### 5.6 List Clients

Get all clients (useful for finding clients to assign as agents).

```http
GET /admin/clients
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search by name, email, or integer ID

**Response:**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "client_id",
        "integerId": 2001,
        "email": "client@example.com",
        "name": "Client Name",
        "role": "client",
        "balance": 50000.00,
        "balanceVersion": 2,
        "isActive": true,
        "isBlocked": false,
        "lastLoginAt": "2024-01-15T10:30:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### 5.7 Get Client by Integer ID

```http
GET /admin/clients/:integerId
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `integerId`: Client's unique integer ID

**Response:** Same as single client in list response

### 5.8 Update Client Password

Change a client's password using their integer ID.

```http
PATCH /admin/clients/:integerId/password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "password": "NewSecurePass123!"
}
```

**Request Body:**
- `password`: New password (min 8 characters)

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Password updated successfully"
  }
}
```

### 5.9 Deposit to Client Account

Add funds to a client's account in SYP.

```http
POST /admin/clients/:id/deposit
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 50000,
  "note": "Account recharge"
}
```

**Path Parameters:**
- `id`: Client ID (MongoDB _id)

**Request Body:**
- `amount`: Amount to deposit in SYP
- `note`: Optional note for the transaction

**Response:**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "transaction_id",
      "userId": "client_id",
      "type": "deposit",
      "amount": 50000.00,
      "balanceBefore": 100000.00,
      "balanceAfter": 150000.00,
      "note": "Account recharge",
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

### 5.10 Withdraw from Client Account

Remove funds from a client's account in SYP.

```http
POST /admin/clients/:id/withdraw
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 10000,
  "note": "Withdrawal request"
}
```

**Path Parameters:**
- `id`: Client ID (MongoDB _id)

**Request Body:**
- `amount`: Amount to withdraw in SYP
- `note`: Optional note for the transaction

**Response:** Similar to deposit

### 5.11 Block Client

Block a client from using the system.

```http
PATCH /admin/clients/:integerId/block
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Client blocked successfully"
  }
}
```

### 5.12 Unblock Client

```http
PATCH /admin/clients/:integerId/unblock
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Client unblocked successfully"
  }
}
```

---

## 6. Order Management

### 6.1 Place Order (Admin)

Admin can place orders for any service type. No balance check required for admin.

```http
POST /admin/orders
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "serviceId": "service_id",
  "quantity": 1,
  "customerInput": {
    "phone": "0944123456"
  },
  "idempotencyKey": "unique-request-id"
}
```

**Request Body:**
- `serviceId`: Service ID from the services list
- `quantity`: Quantity to order
- `customerInput`: Customer-specific input (phone, etc.)
- `idempotencyKey`: Optional - prevents duplicate orders

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_id",
      "externalProvider": {
        "id": "provider_id",
        "name": "Shehabi",
        "providerType": "shehabi"
      },
      "performedBy": {
        "id": "admin_id",
        "name": "Admin Name",
        "role": "admin"
      },
      "status": "pending",
      "providerStatus": "wait",
      "amountSYP": 10600.00,
      "costUSD": 0.00,
      "profitUSD": 0.00,
      "quantity": 1,
      "customerInput": {
        "phone": "0944123456"
      },
      "userBalanceBefore": 0.00,
      "userBalanceAfter": 0.00,
      "providerBalanceBefore": 150000.00,
      "providerBalanceAfter": 139400.00,
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

**Provider Status Values:**
- `wait`: Waiting for provider response
- `accept`: Provider accepted the order
- `reject`: Provider rejected the order

### 6.2 List All Orders

Get all orders in the system with filtering.

```http
GET /admin/orders?page=1&limit=20&status=completed&providerStatus=accept
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by internal status (pending, processing, completed, failed, cancelled, wait)
- `providerStatus`: Filter by provider status (accept, reject, wait)
- `userId`: Filter by specific user ID

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
          "name": "Shehabi",
          "providerType": "shehabi"
        },
        "performedBy": {
          "id": "user_id",
          "name": "John Doe",
          "role": "client"
        },
        "status": "completed",
        "providerStatus": "accept",
        "amountSYP": 10600.00,
        "quantity": 1,
        "customerInput": {
          "phone": "0944123456"
        },
        "userBalanceBefore": 50000.00,
        "userBalanceAfter": 39400.00,
        "providerBalanceBefore": 150000.00,
        "providerBalanceAfter": 139400.00,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20
  }
}
```

### 6.3 Get Client Orders

Get orders for a specific client by their integer ID.

```http
GET /admin/clients/:integerId/orders?page=1&limit=20&status=completed
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `integerId`: Client's unique integer ID

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by status
- `providerStatus`: Filter by provider status

**Response:** Same as list orders

### 6.4 Refresh Order Status

Manually trigger a status check for a specific order.

```http
POST /admin/orders/:id/refresh
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `id`: Order ID

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_id",
      "status": "completed",
      "providerStatus": "accept",
      "amountSYP": 10600.00,
      "quantity": 1,
      "customerInput": {
        "phone": "0944123456"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:35:00.000Z"
    }
  }
}
```

### 6.5 List Wait Orders (مزود)

Get all مزود category orders waiting for admin approval.

```http
GET /admin/orders/wait
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
        "performedBy": {
          "id": "user_id",
          "name": "John Doe",
          "role": "client"
        },
        "status": "wait",
        "providerStatus": "wait",
        "amountSYP": 15000.00,
        "quantity": 1,
        "customerInput": {
          "phone": "0944123456"
        },
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### 6.6 Accept Wait Order

Approve a مزود category order and process it.

```http
POST /admin/orders/:orderId/accept
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `orderId`: Order ID

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_id",
      "status": "pending",
      "providerStatus": "wait",
      "amountSYP": 15000.00,
      "quantity": 1,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:35:00.000Z"
    }
  }
}
```

### 6.7 Reject Wait Order

Reject a مزود category order.

```http
POST /admin/orders/:orderId/reject
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `orderId`: Order ID

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_id",
      "status": "failed",
      "providerStatus": "reject",
      "amountSYP": 15000.00,
      "quantity": 1,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:35:00.000Z"
    }
  }
}
```

### 6.8 Trigger Order Status Check (Manual)

Manually trigger the background job to check all pending order statuses.

```http
POST /admin/orders/check-status
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Order status check initiated"
  }
}
```

---

## 7. Transaction Management

### 7.1 List All Transactions

Get all transactions in the system.

```http
GET /admin/transactions?page=1&limit=30&type=deposit
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 30)
- `type`: Filter by transaction type (deposit, withdrawal, order, refund)
- `userId`: Filter by specific user ID

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "transaction_id",
        "userId": "user_id",
        "user": {
          "id": "user_id",
          "name": "John Doe",
          "integerId": 2001
        },
        "type": "deposit",
        "amount": 50000.00,
        "balanceBefore": 100000.00,
        "balanceAfter": 150000.00,
        "relatedOrderId": "order_id",
        "note": "Account recharge",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 30
  }
}
```

### 7.2 Get Client Transactions

Get transactions for a specific client.

```http
GET /admin/clients/:integerId/transactions?page=1&limit=30
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `integerId`: Client's unique integer ID

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 30)
- `type`: Filter by transaction type

**Response:** Same as list transactions

---

## 8. Provider Deposit Management

### 8.1 List Provider Deposits

Get all provider deposits.

```http
GET /admin/provider-deposits
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deposits": [
      {
        "id": "deposit_id",
        "providerId": "provider_id",
        "provider": {
          "id": "provider_id",
          "name": "Shehabi",
          "providerType": "shehabi"
        },
        "amountSYP": 500000.00,
        "amountUSD": 0.00,
        "exchangeRate": 12500,
        "note": "Monthly deposit",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### 8.2 Create Provider Deposit

Record a deposit to a provider account.

```http
POST /admin/provider-deposits
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "providerId": "provider_id",
  "amountSYP": 500000,
  "amountUSD": 0,
  "exchangeRate": 12500,
  "note": "Monthly deposit"
}
```

**Request Body:**
- `providerId`: Provider ID
- `amountSYP`: Amount in SYP (for Shehabi)
- `amountUSD`: Amount in USD (for Tempo)
- `exchangeRate`: Exchange rate used
- `note`: Optional note

**Response:**
```json
{
  "success": true,
  "data": {
    "deposit": {
      "id": "deposit_id",
      "providerId": "provider_id",
      "amountSYP": 500000.00,
      "amountUSD": 0.00,
      "exchangeRate": 12500,
      "note": "Monthly deposit",
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

### 8.3 Get Provider Deposit by ID

```http
GET /admin/provider-deposits/:id
Authorization: Bearer <access_token>
```

**Response:** Same as single deposit in list response

### 8.4 Delete Provider Deposit

```http
DELETE /admin/provider-deposits/:id
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deposit": {
      "id": "deposit_id"
    }
  }
}
```

---

## 9. System Management

### 9.1 Refresh Products Cache

Manually refresh the merged products cache.

```http
POST /admin/merged-products/refresh
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Products cache refreshed successfully"
  }
}
```

---

## 10. Notification Management

### 10.1 Send Notification to All Users

Send a notification to all users in the system.

```http
POST /admin/notifications/send-all
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "System Maintenance",
  "body": "The system will be under maintenance tonight from 10 PM to 12 AM",
  "type": "system",
  "data": {
    "maintenanceStart": "2024-01-15T22:00:00Z",
    "maintenanceEnd": "2024-01-16T00:00:00Z"
  }
}
```

**Request Body:**
- `title`: Notification title (required, max 200 chars)
- `body`: Notification body (required, max 1000 chars)
- `type`: Notification type (system, promotion, order, balance, announcement)
- `data`: Optional additional data payload

**Response:**
```json
{
  "success": true,
  "data": {
    "notification": {
      "id": "notification_id",
      "title": "System Maintenance",
      "body": "The system will be under maintenance tonight from 10 PM to 12 AM",
      "type": "system",
      "target": "all",
      "targetRoles": [],
      "targetUserIds": [],
      "sentBy": {
        "id": "admin_id",
        "name": "Admin Name",
        "role": "admin"
      },
      "status": "sent",
      "sentAt": "2024-01-15T10:30:00.000Z",
      "data": {
        "maintenanceStart": "2024-01-15T22:00:00Z",
        "maintenanceEnd": "2024-01-16T00:00:00Z"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "message": "Notification sent successfully"
}
```

### 10.2 Send Notification to Specific Roles

Send a notification to users with specific roles.

```http
POST /admin/notifications/send-roles
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "New Promotion",
  "body": "Special discount for agents this week!",
  "type": "promotion",
  "roles": ["client", "agent"],
  "data": {
    "discountPercent": 10,
    "validUntil": "2024-01-31T23:59:59Z"
  }
}
```

**Request Body:**
- `title`: Notification title (required)
- `body`: Notification body (required)
- `type`: Notification type
- `roles`: Array of roles to target (admin, client, agent)
- `data`: Optional additional data payload

**Response:** Similar to send-all

### 10.3 Send Notification to Specific Users

Send a notification to specific users by their IDs.

```http
POST /admin/notifications/send-users
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Order Update",
  "body": "Your order has been completed successfully",
  "type": "order",
  "userIds": ["user_id_1", "user_id_2"],
  "data": {
    "orderId": "order_id",
    "orderStatus": "completed"
  }
}
```

**Request Body:**
- `title`: Notification title (required)
- `body`: Notification body (required)
- `type`: Notification type
- `userIds`: Array of user IDs to target
- `data`: Optional additional data payload

**Response:** Similar to send-all

### 10.4 List All Notifications

Get all notifications sent by admins.

```http
GET /admin/notifications?page=1&limit=20&status=sent&type=system
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by status (pending, sent, failed)
- `type`: Filter by notification type
- `target`: Filter by target type (all, specific, role)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notification_id",
        "title": "System Maintenance",
        "body": "The system will be under maintenance tonight",
        "type": "system",
        "target": "all",
        "status": "sent",
        "sentBy": {
          "id": "admin_id",
          "name": "Admin Name",
          "role": "admin"
        },
        "sentAt": "2024-01-15T10:30:00.000Z",
        "readBy": ["user_id_1", "user_id_2"],
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 20
  }
}
```

### 10.5 Get Notification by ID

```http
GET /admin/notifications/:id
Authorization: Bearer <access_token>
```

**Response:** Same as single notification in list response

### 10.6 Delete Notification

```http
DELETE /admin/notifications/:id
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notification": {
      "id": "notification_id"
    }
  }
}
```

---

## 11. Client Notification Endpoints

These endpoints are available to clients (not admins) for managing their notifications.

### 11.1 List Client Notifications

Get notifications for the authenticated client.

```http
GET /client/notifications?page=1&limit=20&unreadOnly=false
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `unreadOnly`: Set to `true` to get only unread notifications

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notification_id",
        "title": "System Maintenance",
        "body": "The system will be under maintenance tonight",
        "type": "system",
        "target": "all",
        "sentBy": {
          "id": "admin_id",
          "name": "Admin Name",
          "role": "admin"
        },
        "status": "sent",
        "sentAt": "2024-01-15T10:30:00.000Z",
        "data": {},
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 20
  }
}
```

### 11.2 Get Client Notification by ID

```http
GET /client/notifications/:id
Authorization: Bearer <access_token>
```

**Response:** Same as single notification in list response

### 11.3 Mark Notification as Read

Mark a specific notification as read for the authenticated user.

```http
PATCH /client/notifications/:id/read
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notification": {
      "id": "notification_id",
      "title": "System Maintenance",
      "body": "The system will be under maintenance tonight",
      "readBy": ["user_id"],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:35:00.000Z"
    }
  },
  "message": "Notification marked as read"
}
```

### 11.4 Mark All Notifications as Read

Mark all notifications as read for the authenticated user.

```http
PATCH /client/notifications/read-all
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "modifiedCount": 5
  },
  "message": "All notifications marked as read"
}
```

### 11.5 Get Unread Notification Count

Get the count of unread notifications for the authenticated user.

```http
GET /client/notifications/unread-count
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 3
  }
}
```

---

## Order Status Auto-Update

The system includes automatic order status updates via background jobs:

- **Interval**: Every 5 minutes (configurable)
- **Function**: Checks pending orders with providers
- **Updates**: Automatically updates order status based on provider response
- **Manual Trigger**: Admin can manually trigger status check via `/admin/orders/check-status`

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific field error"
    }
  ]
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

---

## Flutter Integration Tips

1. **Token Management:**
   - Store access token securely (e.g., flutter_secure_storage)
   - Implement automatic token refresh logic
   - Handle 401 errors by refreshing token and retrying

2. **Pagination:**
   - All list endpoints support pagination
   - Use `page` and `limit` parameters
   - Display total count to users

3. **Real-time Updates:**
   - Implement polling for order status updates
   - Or implement WebSocket for real-time updates
   - Consider refresh interval of 30-60 seconds for orders

4. **Error Handling:**
   - Implement retry logic for network failures
   - Show user-friendly error messages
   - Log errors for debugging

5. **Search & Filtering:**
   - Use search parameters for better UX
   - Implement debouncing for search inputs
   - Cache filter states

6. **Notifications:**
   - Poll for unread notification count periodically (every 30-60 seconds)
   - Show notification badge/icon when unread count > 0
   - Implement pull-to-refresh for notification list
   - Mark notifications as read when user opens them
   - Use notification data payload for deep linking to relevant screens

---

## Summary

This backend provides a complete admin API with:

✅ **Authentication & Profile**: Login, profile management, token refresh  
✅ **Provider Balance**: View and sync balances from Tempo and Shehabi  
✅ **Services & Pricing**: Get services, manage badges, set badge-specific pricing  
✅ **Exchange Rate**: Set and view USD to SYP exchange rates  
✅ **Agent Management**: Full CRUD for agents, client management, password changes, account charging  
✅ **Order Management**: Place orders, view all orders, filter by status, auto-update status  
✅ **Transaction Management**: View all transactions, client transaction history  
✅ **Provider Deposits**: Track deposits to provider accounts  
✅ **Notification System**: Send notifications to all users, specific roles, or specific users; clients can view and manage their notifications

The system is production-ready for your Flutter application except for the notification feature, which needs to be implemented based on your preferred notification approach.