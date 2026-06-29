# Client API Documentation

This documentation describes the API endpoints available to **Client** users. Clients are end-users who can view their orders and transaction history.

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

### Orders

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
        "id": "user_id",
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
      "id": "user_id",
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

Retrieve a list of your own transactions.

```http
GET /client/transactions
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
- `client_deposit` - Deposit to client balance
- `client_withdraw` - Withdrawal from client balance
- `agent_to_client_transfer` - Transfer from agent to client
- `order_refund` - Refund for failed/cancelled order

**Response:**

```json
{
  "success": true,
  "data": [
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
        "name": "Admin",
        "email": "admin@sayed.com"
      },
      "balanceBefore": 100000.00,
      "balanceAfter": 150000.00,
      "order": null,
      "externalProvider": null,
      "providerBalanceBefore": null,
      "providerBalanceAfter": null,
      "description": "Deposit to client balance",
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
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
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

## Support

For API support or questions, contact your system administrator.
