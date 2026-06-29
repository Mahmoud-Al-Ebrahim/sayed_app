# Admin API Documentation

This documentation describes the API endpoints available to **Admin** users. Admins have full system access to manage users, providers, services, balances, and all platform operations.

## Base URL

```
http://localhost:3000
```

## Authentication

All admin endpoints require authentication. Include the JWT access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Obtaining Access Token

Admins can authenticate using:

1. **Email/Password Login**
   ```http
   POST /auth/login
   Content-Type: application/json

   {
     "email": "admin@sayed.com",
     "password": "Admin123!"
   }
   ```

2. **Google OAuth**
   ```http
   POST /auth/google
   Content-Type: application/json

   {
     "idToken": "google-oauth-id-token"
   }
   ```

### Refreshing Tokens

Access tokens expire after 15 minutes. Use the refresh token to get a new access token:

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

## Endpoints

### Agent Management

#### List Agents

Retrieve a list of all agents.

```http
GET /admin/agents
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Items per page | 20 |
| `isActive` | boolean | Filter by active status | - |
| `search` | string | Search in name/email | - |
| `sortBy` | string | Sort field (name, email, balance, createdAt) | createdAt |
| `sortOrder` | string | Sort order (asc, desc) | desc |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "agent_id",
      "integerId": 1001,
      "email": "agent@example.com",
      "name": "Agent Name",
      "role": "agent",
      "badge": {
        "id": "badge_id",
        "name": "bronze",
        "displayName": "Bronze"
      },
      "balance": 150000.00,
      "balanceVersion": 5,
      "isActive": true,
      "lastLoginAt": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

#### Create Agent

Create a new agent account.

```http
POST /admin/agents
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "email": "newagent@example.com",
  "password": "SecurePass123!",
  "name": "New Agent",
  "badgeId": "badge_id"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Agent email address |
| `password` | string | Yes | Password (min 8 characters) |
| `name` | string | Yes | Agent full name |
| `badgeId` | string | No | Badge ID for profit margin |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "agent_id",
    "integerId": 1002,
    "email": "newagent@example.com",
    "name": "New Agent",
    "role": "agent",
    "badge": {
      "id": "badge_id",
      "name": "bronze",
      "displayName": "Bronze"
    },
    "balance": 0.00,
    "balanceVersion": 0,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Update Agent

Update agent details.

```http
PATCH /admin/agents/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "isActive": true
}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Agent ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Updated name |
| `isActive` | boolean | No | Active status |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "agent_id",
    "integerId": 1001,
    "email": "agent@example.com",
    "name": "Updated Name",
    "role": "agent",
    "badge": {
      "id": "badge_id",
      "name": "bronze",
      "displayName": "Bronze"
    },
    "balance": 150000.00,
    "isActive": true,
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

#### Deposit to Agent

Deposit funds to an agent's balance.

```http
POST /admin/agents/:id/deposit
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 50000,
  "description": "Weekly balance top-up"
}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Agent ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | number | Yes | Amount to deposit (SYP) |
| `description` | string | No | Description of deposit |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "transaction_id",
    "type": "agent_deposit",
    "currency": "SYP",
    "amount": 50000.00,
    "user": {
      "id": "agent_id",
      "name": "Agent Name",
      "email": "agent@example.com"
    },
    "performedBy": {
      "id": "admin_id",
      "name": "Admin",
      "email": "admin@sayed.com"
    },
    "balanceBefore": 150000.00,
    "balanceAfter": 200000.00,
    "description": "Weekly balance top-up",
    "status": "completed",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Withdraw from Agent

Withdraw funds from an agent's balance.

```http
POST /admin/agents/:id/withdraw
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 10000,
  "description": "Balance correction"
}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Agent ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | number | Yes | Amount to withdraw (SYP) |
| `description` | string | No | Description of withdrawal |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "transaction_id",
    "type": "agent_withdraw",
    "currency": "SYP",
    "amount": 10000.00,
    "user": {
      "id": "agent_id",
      "name": "Agent Name",
      "email": "agent@example.com"
    },
    "performedBy": {
      "id": "admin_id",
      "name": "Admin",
      "email": "admin@sayed.com"
    },
    "balanceBefore": 150000.00,
    "balanceAfter": 140000.00,
    "description": "Balance correction",
    "status": "completed",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Update Agent Badge

Update an agent's badge (affects profit margins).

```http
PATCH /admin/agents/:id/badge
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "badgeId": "new_badge_id"
}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Agent ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `badgeId` | string | Yes | New badge ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "agent_id",
    "name": "Agent Name",
    "badge": {
      "id": "new_badge_id",
      "name": "silver",
      "displayName": "Silver"
    },
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

### Client Management

#### List Clients

Retrieve a list of all clients.

```http
GET /admin/clients
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Items per page | 20 |
| `isActive` | boolean | Filter by active status | - |
| `search` | string | Search in name/email | - |
| `sortBy` | string | Sort field (name, email, balance, createdAt) | createdAt |
| `sortOrder` | string | Sort order (asc, desc) | desc |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "client_id",
      "integerId": 2001,
      "email": "client@example.com",
      "name": "Client Name",
      "role": "client",
      "balance": 50000.00,
      "balanceVersion": 2,
      "isActive": true,
      "lastLoginAt": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### Upgrade Client to Agent

Upgrade a client account to agent role.

```http
PATCH /admin/clients/:id/upgrade
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Client ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "client_id",
    "email": "client@example.com",
    "name": "Client Name",
    "role": "agent",
    "badge": {
      "id": "badge_id",
      "name": "bronze",
      "displayName": "Bronze"
    },
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

#### Deposit to Client

Deposit funds to a client's balance.

```http
POST /admin/clients/:id/deposit
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 10000,
  "description": "Customer deposit"
}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Client ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | number | Yes | Amount to deposit (SYP) |
| `description` | string | No | Description of deposit |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "transaction_id",
    "type": "client_deposit",
    "currency": "SYP",
    "amount": 10000.00,
    "user": {
      "id": "client_id",
      "name": "Client Name",
      "email": "client@example.com"
    },
    "performedBy": {
      "id": "admin_id",
      "name": "Admin",
      "email": "admin@sayed.com"
    },
    "balanceBefore": 50000.00,
    "balanceAfter": 60000.00,
    "description": "Customer deposit",
    "status": "completed",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Withdraw from Client

Withdraw funds from a client's balance.

```http
POST /admin/clients/:id/withdraw
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 5000,
  "description": "Refund processing"
}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Client ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | number | Yes | Amount to withdraw (SYP) |
| `description` | string | No | Description of withdrawal |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "transaction_id",
    "type": "client_withdraw",
    "currency": "SYP",
    "amount": 5000.00,
    "user": {
      "id": "client_id",
      "name": "Client Name",
      "email": "client@example.com"
    },
    "performedBy": {
      "id": "admin_id",
      "name": "Admin",
      "email": "admin@sayed.com"
    },
    "balanceBefore": 60000.00,
    "balanceAfter": 55000.00,
    "description": "Refund processing",
    "status": "completed",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Balance Request Management

#### List Balance Requests

Retrieve all balance requests from agents.

```http
GET /admin/balance-requests
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Items per page | 20 |
| `status` | string | Filter by status (pending, approved, rejected) | - |
| `agentId` | string | Filter by agent | - |
| `sortBy` | string | Sort field (createdAt, amount) | createdAt |
| `sortOrder` | string | Sort order (asc, desc) | desc |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "request_id",
      "agent": {
        "id": "agent_id",
        "name": "Agent Name",
        "email": "agent@example.com",
        "integerId": 1001
      },
      "amount": 50000.00,
      "status": "pending",
      "description": "Need balance for weekend orders",
      "approvedBy": null,
      "approvedAt": null,
      "rejectionReason": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "totalPages": 1
  }
}
```

#### Approve Balance Request

Approve a pending balance request.

```http
POST /admin/balance-requests/:id/approve
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Balance request ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "request_id",
    "status": "approved",
    "approvedBy": {
      "id": "admin_id",
      "name": "Admin"
    },
    "approvedAt": "2024-01-15T10:35:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

#### Reject Balance Request

Reject a pending balance request.

```http
POST /admin/balance-requests/:id/reject
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "reason": "Insufficient funds available"
}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Balance request ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | string | Yes | Rejection reason |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "request_id",
    "status": "rejected",
    "rejectionReason": "Insufficient funds available",
    "approvedBy": {
      "id": "admin_id",
      "name": "Admin"
    },
    "approvedAt": "2024-01-15T10:35:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

### Exchange Rate Management

#### Get Exchange Rate

Get the current active exchange rate.

```http
GET /admin/exchange-rate
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "rate_id",
    "rate": 10600.00,
    "isActive": true,
    "effectiveDate": "2024-01-15T00:00:00.000Z",
    "createdAt": "2024-01-15T00:00:00.000Z"
  }
}
```

#### Set Exchange Rate

Set a new exchange rate.

```http
POST /admin/exchange-rate
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "rate": 10800,
  "effectiveDate": "2024-01-16T00:00:00.000Z"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rate` | number | Yes | USD to SYP exchange rate |
| `effectiveDate` | string | No | When this rate becomes effective (ISO 8601) |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "rate_id",
    "rate": 10800.00,
    "isActive": true,
    "effectiveDate": "2024-01-16T00:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### List Exchange Rates

Get historical exchange rates.

```http
GET /admin/exchange-rates
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Items per page | 20 |
| `isActive` | boolean | Filter by active status | - |
| `sortBy` | string | Sort field (effectiveDate, rate) | effectiveDate |
| `sortOrder` | string | Sort order (asc, desc) | desc |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "rate_id",
      "rate": 10800.00,
      "isActive": true,
      "effectiveDate": "2024-01-16T00:00:00.000Z",
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
```

### Provider Management

#### List Providers

Retrieve all external providers.

```http
GET /admin/providers
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Items per page | 20 |
| `providerType` | string | Filter by type (shehabi, tempo) | - |
| `isActive` | boolean | Filter by active status | - |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "provider_id",
      "name": "Shehabi",
      "providerType": "shehabi",
      "websiteUrl": "https://api.alshahen-store.com/",
      "balanceCurrency": "SYP",
      "balanceSYP": 5000000.00,
      "balanceUSD": 0.00,
      "isActive": true,
      "lastSyncedAt": "2024-01-15T10:30:00.000Z",
      "notes": "Primary provider for MTN/Syriatel",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

#### Create Provider

Add a new external provider.

```http
POST /admin/providers
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "New Provider",
  "providerType": "tempo",
  "websiteUrl": "https://example.com",
  "apiToken": "provider-api-token",
  "notes": "Additional provider"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Provider name |
| `providerType` | string | Yes | Provider type (shehabi, tempo) |
| `websiteUrl` | string | No | Provider website URL |
| `apiToken` | string | Yes | API token for authentication |
| `notes` | string | No | Additional notes |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "provider_id",
    "name": "New Provider",
    "providerType": "tempo",
    "websiteUrl": "https://example.com",
    "balanceCurrency": "USD",
    "balanceUSD": 0.00,
    "isActive": true,
    "notes": "Additional provider",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Update Provider

Update provider details.

```http
PATCH /admin/providers/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "isActive": true,
  "apiToken": "new-api-token"
}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Provider ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Updated name |
| `websiteUrl` | string | No | Updated website URL |
| `isActive` | boolean | No | Active status |
| `apiToken` | string | No | New API token |
| `notes` | string | No | Updated notes |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "provider_id",
    "name": "Updated Name",
    "providerType": "tempo",
    "websiteUrl": "https://example.com",
    "isActive": true,
    "notes": "Additional provider",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

#### Sync Provider Balance

Sync the balance from the provider's API.

```http
POST /admin/providers/:id/sync-balance
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Provider ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "provider_id",
    "name": "Shehabi",
    "balanceSYP": 5200000.00,
    "balanceUSD": 0.00,
    "lastSyncedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

#### Sync Provider Products

Sync products from the provider's API.

```http
POST /admin/providers/:id/sync-products
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "marginPercent": 10
}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Provider ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `marginPercent` | number | No | Profit margin percentage (default: 0) |

**Response:**

```json
{
  "success": true,
  "data": {
    "created": 50,
    "updated": 20,
    "skipped": 30,
    "items": [
      {
        "id": "service_id",
        "name": "MTN 100 Units",
        "externalServiceId": "5120",
        "costPriceUSD": 100.00,
        "sellingPriceSYP": 10600.00,
        "isActive": true
      }
    ]
  }
}
```

### Service Management

#### List Services

Retrieve all services.

```http
GET /admin/services
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Items per page | 50 |
| `provider` | string | Filter by provider ID | - |
| `category` | string | Filter by category | - |
| `isActive` | boolean | Filter by active status | - |
| `search` | string | Search in name/description | - |
| `sortBy` | string | Sort field (name, price, sortOrder) | sortOrder |
| `sortOrder` | string | Sort order (asc, desc) | asc |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "service_id",
      "name": "MTN 100 Units",
      "description": "Mobile top-up service",
      "externalProvider": {
        "id": "provider_id",
        "name": "Shehabi",
        "providerType": "shehabi"
      },
      "externalServiceId": "5120",
      "costPriceUSD": 100.00,
      "sellingPriceSYP": 10600.00,
      "pricingType": "fixed",
      "quantityRules": {
        "min": 1,
        "max": 1
      },
      "requiredFields": [
        {
          "key": "phone",
          "label": "أدخل الرقم بدون النداء",
          "type": "phone",
          "required": true
        }
      ],
      "category": "وحدات ام تي ان",
      "isActive": true,
      "sortOrder": 0,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

#### Create Service

Create a new service manually.

```http
POST /admin/services
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Custom Service",
  "description": "Custom service description",
  "externalProviderId": "provider_id",
  "externalServiceId": "custom-123",
  "costPriceUSD": 50.00,
  "sellingPriceSYP": 53000.00,
  "pricingType": "fixed",
  "quantityRules": {
    "min": 1,
    "max": 10
  },
  "requiredFields": [
    {
      "key": "phone",
      "label": "Phone Number",
      "type": "phone",
      "required": true
    }
  ],
  "category": "custom",
  "isActive": true
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Service name |
| `description` | string | No | Service description |
| `externalProviderId` | string | Yes | Provider ID |
| `externalServiceId` | string | Yes | External service ID |
| `costPriceUSD` | number | Yes | Cost in USD |
| `sellingPriceSYP` | number | Yes | Selling price in SYP |
| `pricingType` | string | No | Pricing type (fixed, per_unit) |
| `quantityRules` | object | No | Quantity rules (min, max) |
| `requiredFields` | array | No | Required customer fields |
| `category` | string | No | Service category |
| `isActive` | boolean | No | Active status |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "service_id",
    "name": "Custom Service",
    "description": "Custom service description",
    "externalProvider": {
      "id": "provider_id",
      "name": "Shehabi"
    },
    "externalServiceId": "custom-123",
    "costPriceUSD": 50.00,
    "sellingPriceSYP": 53000.00,
    "pricingType": "fixed",
    "quantityRules": {
      "min": 1,
      "max": 10
    },
    "requiredFields": [
      {
        "key": "phone",
        "label": "Phone Number",
        "type": "phone",
        "required": true
      }
    ],
    "category": "custom",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Update Service

Update service details.

```http
PATCH /admin/services/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Updated Service Name",
  "sellingPriceSYP": 55000.00,
  "isActive": true
}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Service ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Updated name |
| `description` | string | No | Updated description |
| `costPriceUSD` | number | No | Updated cost |
| `sellingPriceSYP` | number | No | Updated selling price |
| `pricingType` | string | No | Updated pricing type |
| `quantityRules` | object | No | Updated quantity rules |
| `requiredFields` | array | No | Updated required fields |
| `category` | string | No | Updated category |
| `isActive` | boolean | No | Active status |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "service_id",
    "name": "Updated Service Name",
    "sellingPriceSYP": 55000.00,
    "isActive": true,
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

#### Delete Service

Delete a service.

```http
DELETE /admin/services/:id
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Service ID |

**Response:**

```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```

### Order Management

#### List Orders

Retrieve all orders.

```http
GET /admin/orders
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Items per page | 20 |
| `status` | string | Filter by status | - |
| `provider` | string | Filter by provider type | - |
| `agentId` | string | Filter by agent | - |
| `startDate` | string | Filter by start date | - |
| `endDate` | string | Filter by end date | - |
| `sortBy` | string | Sort field (createdAt, amountSYP) | createdAt |
| `sortOrder` | string | Sort order (asc, desc) | desc |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "order_id",
      "service": {
        "id": "service_id",
        "name": "MTN 100 Units"
      },
      "externalProvider": {
        "id": "provider_id",
        "name": "Shehabi",
        "providerType": "shehabi"
      },
      "performedBy": {
        "id": "agent_id",
        "name": "Agent Name",
        "email": "agent@example.com",
        "role": "agent"
      },
      "status": "completed",
      "amountSYP": 10600.00,
      "costUSD": 100.00,
      "profitUSD": 5.00,
      "badge": {
        "id": "badge_id",
        "name": "bronze",
        "displayName": "Bronze"
      },
      "exchangeRateAtOrder": 10600.00,
      "quantity": 1,
      "customerInput": {
        "phone": "0944123456"
      },
      "externalOrderId": "provider_order_id",
      "externalOrderUuid": "uuid-string",
      "providerResponse": {},
      "failureReason": null,
      "debitTransaction": "transaction_id",
      "refundTransaction": null,
      "statusCheckAttempts": 3,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:35:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### Place Order

Place an order as admin.

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

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `serviceId` | string | Yes | Service ID |
| `quantity` | number | No | Quantity (default: 1) |
| `customerInput` | object | Yes | Customer data |
| `idempotencyKey` | string | No | Unique key for idempotency |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "order_id",
    "service": {
      "id": "service_id",
      "name": "MTN 100 Units"
    },
    "externalProvider": {
      "id": "provider_id",
      "name": "Shehabi",
      "providerType": "shehabi"
    },
    "performedBy": {
      "id": "admin_id",
      "name": "Admin",
      "email": "admin@sayed.com",
      "role": "admin"
    },
    "status": "processing",
    "amountSYP": 10600.00,
    "costUSD": 100.00,
    "profitUSD": 0.00,
    "exchangeRateAtOrder": 10600.00,
    "quantity": 1,
    "customerInput": {
      "phone": "0944123456"
    },
    "externalOrderId": "provider_order_id",
    "externalOrderUuid": "uuid-string",
    "providerResponse": {},
    "debitTransaction": "transaction_id",
    "statusCheckAttempts": 0,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Refresh Order Status

Manually trigger a status check for an order.

```http
POST /admin/orders/:id/refresh
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Order ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "order_id",
    "status": "completed",
    "providerResponse": {
      "status": "completed",
      "message": "Order fulfilled successfully"
    },
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

### Transaction Management

#### List Transactions

Retrieve all transactions.

```http
GET /admin/transactions
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Items per page | 20 |
| `type` | string | Filter by transaction type | - |
| `status` | string | Filter by status | - |
| `userId` | string | Filter by user | - |
| `startDate` | string | Filter by start date | - |
| `endDate` | string | Filter by end date | - |
| `sortBy` | string | Sort field (createdAt, amount) | createdAt |
| `sortOrder` | string | Sort order (asc, desc) | desc |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "transaction_id",
      "type": "agent_deposit",
      "currency": "SYP",
      "amount": 50000.00,
      "user": {
        "id": "agent_id",
        "name": "Agent Name",
        "email": "agent@example.com"
      },
      "performedBy": {
        "id": "admin_id",
        "name": "Admin",
        "email": "admin@sayed.com"
      },
      "balanceBefore": 100000.00,
      "balanceAfter": 150000.00,
      "order": null,
      "externalProvider": null,
      "providerBalanceBefore": null,
      "providerBalanceAfter": null,
      "description": "Deposit to agent balance",
      "metadata": {},
      "status": "completed",
      "idempotencyKey": "unique-key",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Badge Management

#### List Badges

Retrieve all badges.

```http
GET /admin/badges
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `isActive` | boolean | Filter by active status | - |
| `sortBy` | string | Sort field (level, name) | level |
| `sortOrder` | string | Sort order (asc, desc) | asc |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "badge_id",
      "name": "bronze",
      "displayName": "Bronze",
      "description": "Entry level badge",
      "level": 1,
      "isActive": true,
      "icon": "bronze-icon",
      "color": "#CD7F32",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Create Badge

Create a new badge.

```http
POST /admin/badges
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "platinum",
  "displayName": "Platinum",
  "description": "Highest tier badge",
  "level": 4,
  "icon": "platinum-icon",
  "color": "#E5E4E2"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Unique badge name |
| `displayName` | string | Yes | Display name |
| `description` | string | No | Badge description |
| `level` | number | Yes | Badge level (higher = higher tier) |
| `icon` | string | No | Icon identifier |
| `color` | string | No | Color code |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "badge_id",
    "name": "platinum",
    "displayName": "Platinum",
    "description": "Highest tier badge",
    "level": 4,
    "isActive": true,
    "icon": "platinum-icon",
    "color": "#E5E4E2",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Get Badge

Get details of a specific badge.

```http
GET /admin/badges/:id
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Badge ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "badge_id",
    "name": "bronze",
    "displayName": "Bronze",
    "description": "Entry level badge",
    "level": 1,
    "isActive": true,
    "icon": "bronze-icon",
    "color": "#CD7F32",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Badge

Update badge details.

```http
PATCH /admin/badges/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "displayName": "Updated Bronze",
  "isActive": true
}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Badge ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `displayName` | string | No | Updated display name |
| `description` | string | No | Updated description |
| `level` | number | No | Updated level |
| `isActive` | boolean | No | Active status |
| `icon` | string | No | Updated icon |
| `color` | string | No | Updated color |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "badge_id",
    "name": "bronze",
    "displayName": "Updated Bronze",
    "level": 1,
    "isActive": true,
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

#### Delete Badge

Delete a badge.

```http
DELETE /admin/badges/:id
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Badge ID |

**Response:**

```json
{
  "success": true,
  "message": "Badge deleted successfully"
}
```

### Product Profit Management

#### List Product Profits

Retrieve custom profit settings for products.

```http
GET /admin/product-profits
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Items per page | 20 |
| `badgeId` | string | Filter by badge | - |
| `providerId` | string | Filter by provider | - |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "profit_id",
      "badge": {
        "id": "badge_id",
        "name": "bronze",
        "displayName": "Bronze"
      },
      "provider": {
        "id": "provider_id",
        "name": "Shehabi",
        "providerType": "shehabi"
      },
      "profitMarginPercent": 5.00,
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
```

#### Set Product Profit

Set profit margin for a badge/provider combination.

```http
POST /admin/product-profits
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "badgeId": "badge_id",
  "providerId": "provider_id",
  "profitMarginPercent": 10
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `badgeId` | string | Yes | Badge ID |
| `providerId` | string | Yes | Provider ID |
| `profitMarginPercent` | number | Yes | Profit margin percentage |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "profit_id",
    "badge": {
      "id": "badge_id",
      "name": "bronze",
      "displayName": "Bronze"
    },
    "provider": {
      "id": "provider_id",
      "name": "Shehabi",
      "providerType": "shehabi"
    },
    "profitMarginPercent": 10.00,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Delete Product Profit

Remove custom profit setting.

```http
DELETE /admin/product-profits
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "badgeId": "badge_id",
  "providerId": "provider_id"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `badgeId` | string | Yes | Badge ID |
| `providerId` | string | Yes | Provider ID |

**Response:**

```json
{
  "success": true,
  "message": "Product profit deleted successfully"
}
```

#### Batch Set Product Profits

Set profit margins for multiple products at once.

```http
POST /admin/product-profits/batch
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "profits": [
    {
      "badgeId": "badge_id_1",
      "providerId": "provider_id",
      "profitMarginPercent": 5
    },
    {
      "badgeId": "badge_id_2",
      "providerId": "provider_id",
      "profitMarginPercent": 8
    }
  ]
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `profits` | array | Yes | Array of profit settings |

**Response:**

```json
{
  "success": true,
  "data": {
    "created": 2,
    "updated": 0,
    "failed": 0
  }
}
```

### Merged Products

#### List Merged Products

Get merged product catalog from all providers.

```http
GET /admin/merged-products
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Items per page | 50 |
| `search` | string | Search in name | - |
| `provider` | string | Filter by provider type | - |
| `category` | string | Filter by category | - |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "service_id",
      "name": "MTN 100 Units",
      "description": "Mobile top-up",
      "provider": "shehabi",
      "providerId": "provider_id",
      "category": "وحدات ام تي ان",
      "basePrice": 100.00,
      "sellPrices": {
        "bronze": 10600.00,
        "silver": 10500.00,
        "gold": 10400.00
      },
      "requiredFields": [
        {
          "key": "phone",
          "label": "Phone Number",
          "type": "phone"
        }
      ],
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

#### Refresh Products Cache

Refresh the merged products cache.

```http
POST /admin/merged-products/refresh
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Products cache refreshed successfully"
}
```

### Order Status Check

#### Trigger Order Status Check

Manually trigger the background order status check job.

```http
POST /admin/orders/check-status
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Order status check triggered successfully"
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "errors": [
    {
      "field": "field_name",
      "message": "Specific error message for this field"
    }
  ]
}
```

### Common Error Codes

| HTTP Status | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate resource |
| 422 | Unprocessable Entity - Business logic error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## Rate Limiting

Authentication endpoints are rate-limited to 30 requests per 15 minutes per IP address.

## Best Practices

1. **Use Idempotency Keys** - When placing orders, use unique keys to prevent duplicates
2. **Monitor Provider Balances** - Regularly sync provider balances
3. **Keep Services Updated** - Sync provider products regularly
4. **Review Balance Requests** - Process balance requests promptly
5. **Use Pagination** - For large datasets, use pagination
6. **Audit Transactions** - Regularly review transaction logs
7. **Secure Admin Access** - Use strong passwords and 2FA when available
8. **Backup Data** - Regular database backups are essential

## Support

For API support or questions, contact your system administrator.
