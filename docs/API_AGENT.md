# Agent API Documentation

This documentation describes the API endpoints available to **Agent** users. Agents are resellers who can place orders, request balance deposits, and track their transactions.

## Base URL

```
http://localhost:3000
```

## Authentication

All agent endpoints require authentication. Include the JWT access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Obtaining Access Token

Agents can authenticate using:

1. **Email/Password Login**
   ```http
   POST /auth/login
   Content-Type: application/json

   {
     "email": "agent@example.com",
     "password": "password123"
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

3. **Registration**
   ```http
   POST /auth/register
   Content-Type: application/json

   {
     "email": "agent@example.com",
     "password": "password123",
     "name": "John Doe"
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

### Balance Requests

#### Create Balance Request

Submit a request for balance deposit to the admin for approval.

```http
POST /agent/balance-requests
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 50000,
  "description": "Need balance for weekend orders"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | number | Yes | Amount to request (in SYP) |
| `description` | string | No | Reason for the request |

**Response:**

```json
{
  "success": true,
  "data": {
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
}
```

#### List Balance Requests

Retrieve a list of your balance requests.

```http
GET /agent/balance-requests
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Items per page | 20 |
| `status` | string | Filter by status (pending, approved, rejected) | - |
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

### Exchange Rate

#### Get Exchange Rate

Get the current USD to SYP exchange rate.

```http
GET /agent/exchange-rate
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

### Services

#### List Services

Retrieve the list of available services for ordering.

```http
GET /agent/services
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Items per page | 50 |
| `provider` | string | Filter by provider type (shehabi, tempo) | - |
| `category` | string | Filter by category | - |
| `search` | string | Search in name/description | - |
| `isActive` | boolean | Filter by active status | true |
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
          "placeholder": "0944123456",
          "required": true
        }
      ],
      "category": "وحدات ام تي ان",
      "isActive": true,
      "sortOrder": 0
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

### Orders

#### Place Order

Place a new service order.

```http
POST /agent/orders
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
| `serviceId` | string | Yes | Service ID to order |
| `quantity` | number | No | Quantity (default: 1) |
| `customerInput` | object | Yes | Customer data (phone, game ID, etc.) |
| `idempotencyKey` | string | No | Unique key to prevent duplicate orders |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "order_id",
    "service": {
      "id": "service_id",
      "name": "MTN 100 Units",
      "description": "Mobile top-up service"
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
    "status": "processing",
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
    "statusCheckAttempts": 0,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### List Orders

Retrieve a list of your orders.

```http
GET /agent/orders
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Items per page | 20 |
| `status` | string | Filter by status (pending, processing, completed, failed, cancelled) | - |
| `provider` | string | Filter by provider type | - |
| `startDate` | string | Filter by start date (ISO 8601) | - |
| `endDate` | string | Filter by end date (ISO 8601) | - |
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
        "name": "MTN 100 Units",
        "description": "Mobile top-up service"
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
    "total": 50,
    "totalPages": 3
  }
}
```

#### Get Order Details

Retrieve details of a specific order.

```http
GET /agent/orders/:id
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
    "service": {
      "id": "service_id",
      "name": "MTN 100 Units",
      "description": "Mobile top-up service"
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
}
```

#### Refresh Order Status

Manually trigger a status check for a specific order with the provider.

```http
POST /agent/orders/:id/refresh
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

### Transactions

#### List Transactions

Retrieve a list of your transactions.

```http
GET /agent/transactions
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Items per page | 20 |
| `type` | string | Filter by transaction type | - |
| `status` | string | Filter by status | - |
| `startDate` | string | Filter by start date (ISO 8601) | - |
| `endDate` | string | Filter by end date (ISO 8601) | - |
| `sortBy` | string | Sort field (createdAt, amount) | createdAt |
| `sortOrder` | string | Sort order (asc, desc) | desc |

**Transaction Types:**
- `agent_deposit` - Deposit to agent balance
- `agent_withdraw` - Withdrawal from agent balance
- `service_order` - Service order expense
- `order_refund` - Refund for failed/cancelled order
- `balance_adjustment` - Manual balance adjustment

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
    "total": 50,
    "totalPages": 3
  }
}
```

## Order Status Values

| Status | Description |
|--------|-------------|
| `pending` | Order is pending processing |
| `processing` | Order is being processed by provider |
| `completed` | Order completed successfully |
| `failed` | Order failed |
| `cancelled` | Order was cancelled |

## Balance Request Status Values

| Status | Description |
|--------|-------------|
| `pending` | Request is pending admin approval |
| `approved` | Request approved by admin |
| `rejected` | Request rejected by admin |

## Transaction Status Values

| Status | Description |
|--------|-------------|
| `pending` | Transaction is pending |
| `completed` | Transaction completed successfully |
| `failed` | Transaction failed |
| `cancelled` | Transaction was cancelled |

## Pricing Types

| Type | Description |
|------|-------------|
| `fixed` | Fixed price per order |
| `per_unit` | Price per unit (quantity-based) |

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
| 409 | Conflict - Duplicate resource (e.g., idempotency key) |
| 422 | Unprocessable Entity - Insufficient balance |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## Rate Limiting

Authentication endpoints are rate-limited to 30 requests per 15 minutes per IP address.

## Best Practices

1. **Use Idempotency Keys** - When placing orders, use unique idempotency keys to prevent duplicate orders
2. **Check Balance Before Orders** - Verify sufficient balance before placing orders
3. **Handle Status Updates** - Implement automatic status checking for processing orders
4. **Validate Customer Input** - Ensure customer input matches required field formats
5. **Use Pagination** - For large datasets, use pagination to improve performance
6. **Store Tokens Securely** - Never store tokens in localStorage
7. **Refresh Tokens Before Expiry** - Implement automatic token refresh

## Badge System

Agents have badges that determine their profit margins. Higher-tier badges get better profit rates on orders.

**Badge Levels:**
- Bronze - Base profit margin
- Silver - Increased profit margin
- Gold - Highest profit margin

Your current badge is assigned by the admin and affects the pricing you see when placing orders.

## Support

For API support or questions, contact your system administrator.
