# Client API Documentation

This documentation describes the API endpoints available to **Client** users. Clients can place orders, view services, check their profile, view their transactions, and see available agents.

## Base URL

```
http://localhost:3000
```

## Authentication

All client endpoints require authentication. Include the JWT access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Obtaining Access Token

Clients can authenticate using:

1. **Email/Password Login**
   ```http
   POST /auth/login
   Content-Type: application/json

   {
     "email": "client@example.com",
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
     "email": "client@example.com",
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

### Profile

#### Get Profile

Retrieve your profile information.

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
      "lastLoginAt": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Orders

#### Place Order

Place a new order for a service.

```http
POST /client/orders
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
| `customerInput` | object | Yes | Customer data (e.g., phone number) |
| `idempotencyKey` | string | No | Unique key to prevent duplicate orders |

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
      "performedBy": {
        "id": "user_id",
        "name": "John Doe",
        "role": "client"
      },
      "status": "processing",
      "amountSYP": 10600.00,
      "quantity": 1,
      "customerInput": {
        "phone": "0944123456"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### List Orders

Retrieve a list of your own orders.

```http
GET /client/orders
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Items per page | 20 |
| `status` | string | Filter by status (pending, processing, completed, failed, cancelled) | - |

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
}
```

#### Get Order Details

Retrieve details of a specific order.

```http
GET /client/orders/:id
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
      "service": {
        "id": "service_id",
        "name": "MTN 100 Units"
      },
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
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### Refresh Order Status

Manually trigger a status check for a specific order with the provider.

```http
POST /client/orders/:id/refresh
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
      "providerResponse": {
        "status": "completed",
        "message": "Order fulfilled successfully"
      },
      "updatedAt": "2024-01-15T10:35:00.000Z"
    }
  }
}
```

### Services

#### List Services

Retrieve all available services.

```http
GET /client/services
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `includeProfits` | boolean | Include profit information | false |

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
          "name": "Shehabi",
          "providerType": "shehabi"
        },
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
        "isActive": true
      }
    ]
  }
}
```

### Exchange Rate

#### Get Exchange Rate

Get the current active exchange rate.

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
      "rate": 10600.00,
      "isActive": true,
      "effectiveDate": "2024-01-15T00:00:00.000Z"
    }
  }
}
```

### Transactions

#### List Transactions

Retrieve a list of your own transactions.

```http
GET /client/transactions
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Items per page | 30 |
| `type` | string | Filter by transaction type | - |

**Transaction Types:**
- `client_deposit` - Deposit to client balance
- `client_withdraw` - Withdrawal from client balance
- `service_order` - Order payment
- `order_refund` - Refund for failed/cancelled order

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
        "amount": 50000.00,
        "user": {
          "id": "user_id",
          "name": "John Doe",
          "email": "client@example.com"
        },
        "performedBy": {
          "id": "admin_id",
          "name": "Admin"
        },
        "balanceBefore": 100000.00,
        "balanceAfter": 150000.00,
        "description": "Deposit to client balance",
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

### Agents

#### List Agents

View all available agents (read-only access).

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

## Order Status Values

| Status | Description |
|--------|-------------|
| `pending` | Order is pending processing |
| `processing` | Order is being processed by provider |
| `completed` | Order completed successfully |
| `failed` | Order failed |
| `cancelled` | Order was cancelled |

## Transaction Status Values

| Status | Description |
|--------|-------------|
| `pending` | Transaction is pending |
| `completed` | Transaction completed successfully |
| `failed` | Transaction failed |
| `cancelled` | Transaction was cancelled |

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
| 403 | Forbidden - Account blocked or insufficient permissions |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Insufficient balance |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## Rate Limiting

Authentication endpoints are rate-limited to 30 requests per 15 minutes per IP address.

## Best Practices

1. **Always use HTTPS** in production
2. **Store tokens securely** - Never store tokens in localStorage
3. **Refresh tokens before expiry** - Implement automatic token refresh
4. **Handle errors gracefully** - Display user-friendly error messages
5. **Validate input** - Validate all user input before sending to API
6. **Use pagination** - For large datasets, use pagination to improve performance
7. **Check account status** - Verify your account is not blocked before placing orders

## Support

For API support or questions, contact your system administrator.
