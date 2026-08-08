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

### Agent Collection Management

#### List Agents

Retrieve a list of all agents in the agent collection.

```http
GET /admin/agent-collection
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Items per page | 20 |
| `search` | string | Search in name/phone | - |

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

#### Create Agent

Create a new agent in the agent collection.

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

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Agent full name |
| `address` | string | Yes | Agent address |
| `phone` | string | Yes | Agent phone number |
| `clientIntegerId` | number | Yes | Unique integer ID of existing client |

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

#### Get Agent

Retrieve a specific agent by ID.

```http
GET /admin/agent-collection/:id
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Agent ID |

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

#### Update Agent

Update agent details.

```http
PATCH /admin/agent-collection/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "address": "456 New St",
  "phone": "0944987654"
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
| `address` | string | No | Updated address |
| `phone` | string | No | Updated phone |
| `clientIntegerId` | number | No | Updated client integer ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "agent": {
      "id": "agent_id",
      "name": "Updated Name",
      "address": "456 New St",
      "phone": "0944987654",
      "clientIntegerId": 2001,
      "updatedAt": "2024-01-15T10:35:00.000Z"
    }
  }
}
```

#### Delete Agent

Delete an agent from the collection.

```http
DELETE /admin/agent-collection/:id
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Agent ID |

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

### Client Management

#### List Clients

Retrieve a list of all clients with search functionality.

```http
GET /admin/clients
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Items per page | 20 |
| `search` | string | Search by name, email, or integer ID | - |

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

#### Get Client by Integer ID

Retrieve a specific client by their unique integer ID.

```http
GET /admin/clients/:integerId
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `integerId` | number | Client's unique integer ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "client": {
      "id": "client_id",
      "integerId": 2001,
      "email": "client@example.com",
      "name": "Client Name",
      "role": "client",
      "balance": 50000.00,
      "isActive": true,
      "isBlocked": false
    }
  }
}
```

#### Update Client Password

Update a client's password using their integer ID.

```http
PATCH /admin/clients/:integerId/password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "password": "NewSecurePass123!"
}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `integerId` | number | Client's unique integer ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `password` | string | Yes | New password (min 8 characters) |

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Password updated successfully"
  }
}
```

#### Block Client

Block a client so they cannot use any API or access their data.

```http
PATCH /admin/clients/:integerId/block
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `integerId` | number | Client's unique integer ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Client blocked successfully"
  }
}
```

#### Unblock Client

Unblock a client to restore their API access.

```http
PATCH /admin/clients/:integerId/unblock
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `integerId` | number | Client's unique integer ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Client unblocked successfully"
  }
}
```

#### Get Client Transactions

View a client's transactions using their integer ID.

```http
GET /admin/clients/:integerId/transactions
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `integerId` | number | Client's unique integer ID |

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Items per page | 30 |
| `type` | string | Filter by transaction type | - |

**Response:**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "transaction_id",
        "type": "client_deposit",
        "currency": "SYP",
        "amount": 10000.00,
        "user": {
          "id": "client_id",
          "name": "Client Name"
        },
        "balanceBefore": 50000.00,
        "balanceAfter": 60000.00,
        "status": "completed",
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

#### Deposit to Client

Deposit funds to a client's balance.

```http
POST /admin/clients/:id/deposit
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 10000,
  "note": "Customer deposit"
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
| `note` | string | No | Description of deposit |

**Response:**

```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "transaction_id",
      "type": "client_deposit",
      "currency": "SYP",
      "amount": 10000.00,
      "balanceBefore": 50000.00,
      "balanceAfter": 60000.00,
      "status": "completed"
    }
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
  "note": "Refund processing"
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
| `note` | string | No | Description of withdrawal |

**Response:**

```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "transaction_id",
      "type": "client_withdraw",
      "currency": "SYP",
      "amount": 5000.00,
      "balanceBefore": 60000.00,
      "balanceAfter": 55000.00,
      "status": "completed"
    }
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
    "rate": {
      "id": "rate_id",
      "rate": 10600.00,
      "isActive": true,
      "effectiveDate": "2024-01-15T00:00:00.000Z"
    }
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
    "rate": {
      "id": "rate_id",
      "rate": 10800.00,
      "isActive": true,
      "effectiveDate": "2024-01-16T00:00:00.000Z"
    }
  }
}
```

#### List Exchange Rates

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
        "rate": 10800.00,
        "isActive": true,
        "effectiveDate": "2024-01-16T00:00:00.000Z"
      }
    ]
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
  "data": {
    "providers": [
      {
        "id": "provider_id",
        "name": "Shehabi",
        "providerType": "shehabi",
        "websiteUrl": "https://api.alshahen-store.com/",
        "balanceCurrency": "SYP",
        "balanceSYP": 5000000.00,
        "isActive": true
      }
    ]
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
    "provider": {
      "id": "provider_id",
      "name": "New Provider",
      "providerType": "tempo",
      "websiteUrl": "https://example.com",
      "isActive": true
    }
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
    "provider": {
      "id": "provider_id",
      "name": "Updated Name",
      "providerType": "tempo",
      "isActive": true
    }
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
    "provider": {
      "id": "provider_id",
      "name": "Shehabi",
      "balanceSYP": 5200000.00,
      "lastSyncedAt": "2024-01-15T10:35:00.000Z"
    }
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
    "skipped": 30
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

**Response:**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "service_id",
        "name": "MTN 100 Units",
        "description": "Mobile top-up service",
        "externalProvider": {
          "id": "provider_id",
          "name": "Shehabi"
        },
        "costPriceUSD": 100.00,
        "sellingPriceSYP": 10600.00,
        "isActive": true
      }
    ]
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
  "sellingPriceSYP": 53000.00
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

**Response:**

```json
{
  "success": true,
  "data": {
    "service": {
      "id": "service_id",
      "name": "Custom Service",
      "costPriceUSD": 50.00,
      "sellingPriceSYP": 53000.00,
      "isActive": true
    }
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
| `isActive` | boolean | No | Active status |

**Response:**

```json
{
  "success": true,
  "data": {
    "service": {
      "id": "service_id",
      "name": "Updated Service Name",
      "sellingPriceSYP": 55000.00,
      "isActive": true
    }
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
  "data": {
    "message": "Service deleted successfully"
  }
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
| `startDate` | string | Filter by start date | - |
| `endDate` | string | Filter by end date | - |

**Response:**

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order_id",
        "service": {
          "id": "service_id",
          "name": "MTN 100 Units"
        },
        "performedBy": {
          "id": "client_id",
          "name": "Client Name",
          "role": "client"
        },
        "status": "completed",
        "amountSYP": 10600.00,
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
| `idempotencyKey` | string | No | Unique key to prevent duplicates |

**Response:**

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_id",
      "service": {
        "id": "service_id",
        "name": "MTN 100 Units"
      },
      "status": "processing",
      "amountSYP": 10600.00,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### Refresh Order Status

Manually trigger a status check for a specific order.

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
    "order": {
      "id": "order_id",
      "status": "completed",
      "updatedAt": "2024-01-15T10:35:00.000Z"
    }
  }
}
```

#### List Wait Orders

Retrieve all orders with "wait" status (مزود category orders awaiting admin approval).

```http
GET /admin/orders/wait
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Items per page | 20 |

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

Accept a wait status order (مزود category) and change its status to completed.

```http
POST /admin/orders/:orderId/accept
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `orderId` | string | Order ID |

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

Reject a wait status order (مزود category) with a rejection note. The client will be refunded automatically.

```http
POST /admin/orders/:orderId/reject
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "rejectionNote": "Service temporarily unavailable"
}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `orderId` | string | Order ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rejectionNote` | string | Yes | Reason for rejection |

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
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
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
        "level": 1,
        "isActive": true
      }
    ]
  }
}
```

#### Create Badge

Create a new badge.

```http
POST /admin/badges
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "gold",
  "displayName": "Gold",
  "level": 3,
  "description": "Highest tier badge"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Unique badge name |
| `displayName` | string | Yes | Display name |
| `level` | number | Yes | Badge level |
| `description` | string | No | Badge description |

**Response:**

```json
{
  "success": true,
  "data": {
    "badge": {
      "id": "badge_id",
      "name": "gold",
      "displayName": "Gold",
      "level": 3,
      "isActive": true
    }
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
| `limit` | number | Items per page | 30 |
| `userId` | string | Filter by user ID | - |
| `type` | string | Filter by transaction type | - |

**Response:**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "transaction_id",
        "type": "client_deposit",
        "currency": "SYP",
        "amount": 10000.00,
        "user": {
          "id": "client_id",
          "name": "Client Name"
        },
        "balanceBefore": 50000.00,
        "balanceAfter": 60000.00,
        "status": "completed",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 30,
      "total": 100,
      "totalPages": 4
    }
  }
}
```

## Error Responses

All endpoints may return error responses:

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "errors": [
    {
      "field": "field_name",
      "message": "Specific error message"
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
| 422 | Unprocessable Entity - Insufficient balance |
| 500 | Internal Server Error - Server error |
