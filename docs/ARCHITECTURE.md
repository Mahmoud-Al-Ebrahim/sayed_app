# Architecture Documentation

This document provides a comprehensive overview of the Sayed Backend system architecture, design patterns, and technical implementation details.

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Pattern](#architecture-pattern)
- [Technology Stack](#technology-stack)
- [Database Schema](#database-schema)
- [API Design](#api-design)
- [Authentication & Authorization](#authentication--authorization)
- [Order Processing Flow](#order-processing-flow)
- [Provider Integration](#provider-integration)
- [Balance Management](#balance-management)
- [Background Jobs](#background-jobs)
- [Error Handling](#error-handling)
- [Security Considerations](#security-considerations)
- [Performance Optimization](#performance-optimization)

## System Overview

Sayed Backend is a RESTful API built with Node.js and Express that powers a multi-tier reseller platform. The system manages:

- **User Management**: Multi-role authentication (Admin, Agent, Client)
- **Balance Management**: Financial tracking in SYP and USD
- **Order Processing**: Service order lifecycle with provider integration
- **Provider Integration**: External API integration with Shehabi and Tempo
- **Transaction Logging**: Complete audit trail of all financial operations

### System Components

```
┌─────────────────┐
│   Frontend UI   │
│   (Client/Agent)│
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│   Express API   │
│   (Backend)     │
└────────┬────────┘
         │
    ┌────┴────┬──────────┐
    │         │          │
    ▼         ▼          ▼
┌──────┐ ┌────────┐ ┌──────────┐
│MongoDB│ │Shehabi │ │  Tempo   │
│       │ │  API   │ │   API    │
└──────┘ └────────┘ └──────────┘
```

## Architecture Pattern

### Layered Architecture

The application follows a classic layered architecture:

```
┌─────────────────────────────────┐
│         Routes Layer           │
│    (HTTP Endpoint Definition)   │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│      Controllers Layer         │
│   (Request/Response Handling)   │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│       Services Layer           │
│      (Business Logic)          │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│        Models Layer            │
│    (Data Access & Schema)      │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│         Database               │
│         (MongoDB)              │
└─────────────────────────────────┘
```

### Directory Structure

```
src/
├── app.js                 # Express app configuration
├── server.js              # Server entry point
├── bootstrap/             # Database seeding
│   └── seedAdmin.js
├── config/                # Configuration files
│   ├── db.js             # Database connection
│   └── env.js            # Environment variables
├── constants/             # Constants and enums
│   ├── index.js          # Main constants
│   └── messages.js       # Error messages
├── controllers/            # Request handlers
│   ├── admin.controller.js
│   ├── agent.controller.js
│   ├── auth.controller.js
│   ├── badge.controller.js
│   ├── client.controller.js
│   ├── mergedProducts.controller.js
│   └── productProfit.controller.js
├── middleware/            # Custom middleware
│   ├── auth.js           # Authentication & authorization
│   └── errorHandler.js   # Error handling
├── models/                # Mongoose models
│   ├── Badge.js
│   ├── BalanceRequest.js
│   ├── ExchangeRate.js
│   ├── ExternalProvider.js
│   ├── Order.js
│   ├── ProductProfit.js
│   ├── ProviderDeposit.js
│   ├── Service.js
│   ├── Transaction.js
│   ├── User.js
│   └── index.js
├── providers/             # External provider clients
│   ├── base.client.js    # Base provider client
│   ├── index.js          # Provider factory
│   ├── shehabi.client.js # Shehabi API client
│   └── tempo.client.js   # Tempo API client
├── routes/                # API route definitions
│   ├── admin.routes.js
│   ├── agent.routes.js
│   ├── auth.routes.js
│   ├── client.routes.js
│   └── index.js
├── services/              # Business logic
│   ├── agent.service.js
│   ├── auth.service.js
│   ├── badge.service.js
│   ├── balanceRequest.service.js
│   ├── catalog.service.js
│   ├── exchangeRate.service.js
│   ├── googleAuth.service.js
│   ├── ledger.service.js
│   ├── mergedProducts.service.js
│   ├── order.service.js
│   ├── orderStatusCheck.service.js
│   ├── productProfit.service.js
│   ├── provider.service.js
│   └── transaction.service.js
└── utils/                 # Utility functions
    ├── crypto.js
    ├── money.js
    ├── orderStatus.js
    └── shehabiProducts.js
```

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | >=18.0.0 | Runtime environment |
| Express | 4.21.2 | Web framework |
| MongoDB | 4.4+ | Database |
| Mongoose | 8.9.3 | ODM for MongoDB |

### Dependencies

| Package | Purpose |
|---------|---------|
| bcryptjs | Password hashing |
| jsonwebtoken | JWT authentication |
| google-auth-library | Google OAuth |
| cors | Cross-origin resource sharing |
| helmet | Security headers |
| express-rate-limit | Rate limiting |
| express-mongo-sanitize | MongoDB injection protection |
| dotenv | Environment variable management |
| validator | Input validation |

## Database Schema

### User Model

Represents all users (Admin, Agent, Client) in the system.

```javascript
{
  integerId: Number,           // Unique integer ID for external references
  email: String,               // Unique email address
  name: String,                // Full name
  passwordHash: String,        // Hashed password (hidden)
  googleId: String,            // Google OAuth ID
  authProviders: [String],     // ['local', 'google']
  role: String,                // 'admin', 'agent', 'client'
  badge: ObjectId,             // Reference to Badge (for agents)
  balance: Decimal128,         // Balance in SYP
  balanceVersion: Number,      // Optimistic locking version
  isActive: Boolean,           // Active status
  refreshTokens: [Object],     // Refresh token hashes
  lastLoginAt: Date,           // Last login timestamp
  timestamps: true
}
```

### ExternalProvider Model

Represents external service providers (Shehabi, Tempo).

```javascript
{
  name: String,                // Provider name
  providerType: String,        // 'shehabi' or 'tempo'
  websiteUrl: String,          // Provider website
  balanceCurrency: String,     // 'SYP' or 'USD'
  balanceSYP: Decimal128,      // Balance in SYP
  balanceUSD: Decimal128,      // Balance in USD
  balanceVersion: Number,      // Optimistic locking version
  credentials: String,        // Encrypted API token
  isActive: Boolean,           // Active status
  lastSyncedAt: Date,          // Last sync timestamp
  notes: String,               // Additional notes
  timestamps: true
}
```

### Service Model

Represents resellable services from providers.

```javascript
{
  name: String,                // Service name
  description: String,         // Service description
  externalProvider: ObjectId,  // Reference to provider
  externalServiceId: String,   // Provider's service ID
  costPriceUSD: Decimal128,    // Cost in USD
  sellingPriceSYP: Decimal128, // Selling price in SYP
  pricingType: String,         // 'fixed' or 'per_unit'
  quantityRules: Object,       // Min/max quantities
  upstreamSnapshot: Object,    // Raw provider data
  isActive: Boolean,           // Active status
  requiredFields: [Object],    // Customer input fields
  category: String,            // Service category
  sortOrder: Number,           // Display order
  timestamps: true
}
```

### Order Model

Represents service orders placed by agents/admins.

```javascript
{
  service: ObjectId,           // Reference to service
  externalProvider: ObjectId,  // Reference to provider
  performedBy: ObjectId,       // User who placed order
  status: String,              // Order status
  amountSYP: Decimal128,       // Amount charged (SYP)
  costUSD: Decimal128,         // Cost from provider (USD)
  profitUSD: Decimal128,       // Profit amount (USD)
  badge: ObjectId,             // Badge used for order
  exchangeRateAtOrder: Number, // Exchange rate at order time
  quantity: Number,            // Order quantity
  externalOrderUuid: String,   // UUID for idempotency
  providerResponse: Object,    // Raw provider response
  customerInput: Object,       // Customer-provided data
  externalOrderId: String,     // Provider's order ID
  failureReason: String,       // Failure reason if applicable
  debitTransaction: ObjectId,  // Reference to debit transaction
  refundTransaction: ObjectId, // Reference to refund transaction
  idempotencyKey: String,      // Unique key for idempotency
  statusCheckAttempts: Number, // Number of status checks
  timestamps: true
}
```

### Transaction Model

Represents all financial transactions.

```javascript
{
  type: String,                // Transaction type
  currency: String,             // 'SYP' or 'USD'
  amount: Decimal128,          // Transaction amount
  user: ObjectId,              // User reference
  performedBy: ObjectId,       // Who performed transaction
  balanceBefore: Decimal128,   // Balance before transaction
  balanceAfter: Decimal128,    // Balance after transaction
  order: ObjectId,             // Related order (if applicable)
  externalProvider: ObjectId,  // Related provider (if applicable)
  providerBalanceBefore: Decimal128, // Provider balance before
  providerBalanceAfter: Decimal128,  // Provider balance after
  description: String,          // Transaction description
  metadata: Object,             // Additional metadata
  status: String,              // Transaction status
  idempotencyKey: String,      // Unique key for idempotency
  timestamps: true
}
```

### Badge Model

Represents agent badges for profit margins.

```javascript
{
  name: String,                // Unique badge name
  displayName: String,         // Display name
  description: String,         // Badge description
  level: Number,               // Badge level (higher = higher tier)
  isActive: Boolean,           // Active status
  icon: String,                // Icon identifier
  color: String,               // Color code
  timestamps: true
}
```

### BalanceRequest Model

Represents agent balance deposit requests.

```javascript
{
  agent: ObjectId,             // Agent reference
  amount: Decimal128,          // Requested amount
  status: String,              // 'pending', 'approved', 'rejected'
  description: String,          // Request description
  approvedBy: ObjectId,        // Admin who approved
  approvedAt: Date,            // Approval timestamp
  rejectionReason: String,     // Rejection reason
  timestamps: true
}
```

### ExchangeRate Model

Represents USD to SYP exchange rates.

```javascript
{
  rate: Number,                // Exchange rate
  isActive: Boolean,           // Active status
  effectiveDate: Date,         // When rate becomes effective
  timestamps: true
}
```

### ProductProfit Model

Represents custom profit margins for badge/provider combinations.

```javascript
{
  badge: ObjectId,             // Badge reference
  provider: ObjectId,          // Provider reference
  profitMarginPercent: Number, // Profit margin percentage
  timestamps: true
}
```

## API Design

### RESTful Principles

The API follows RESTful design principles:

- **Resource-based URLs**: Each endpoint represents a resource
- **HTTP methods**: Use appropriate HTTP methods (GET, POST, PATCH, DELETE)
- **Stateless**: Each request contains all necessary information
- **JSON format**: All requests and responses use JSON
- **Standard status codes**: Appropriate HTTP status codes

### Response Format

All responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "field_name",
      "message": "Specific error"
    }
  ]
}
```

### Pagination

List endpoints support pagination:

```javascript
GET /resource?page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

**Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Authentication & Authorization

### JWT Authentication

The system uses JWT (JSON Web Tokens) for authentication:

1. **Access Token**: Short-lived token (15 minutes) for API access
2. **Refresh Token**: Long-lived token (7 days) for obtaining new access tokens

### Token Structure

**Access Token Payload:**
```javascript
{
  userId: ObjectId,
  email: String,
  role: String,
  iat: Number,    // Issued at
  exp: Number     // Expiration
}
```

### Authentication Flow

```
┌─────────┐
│  Login  │
└────┬────┘
     │
     ▼
┌─────────────────┐
│ Validate Creds  │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ Generate Tokens │
│ (Access + Refresh)│
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ Return Tokens   │
└─────────────────┘
```

### Authorization Middleware

Role-based access control is implemented via middleware:

```javascript
// Require authentication
authenticate(req, res, next)

// Require admin role
requireAdmin(req, res, next)

// Require agent or admin
requireAgentOrAdmin(req, res, next)

// Require any authenticated user
requireAuthenticated(req, res, next)
```

### Google OAuth Integration

Google OAuth is supported for user authentication:

1. User authenticates with Google
2. Frontend receives Google ID token
3. Backend validates token with Google
4. User is created or logged in
5. JWT tokens are generated

## Order Processing Flow

### Order Lifecycle

```
┌─────────────┐
│ Place Order │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Call Provider  │
│     API First   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Create Local   │
│   Order Record │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Debit Balances │
│ (User + Provider)│
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Return Order   │
└─────────────────┘
```

### Order Status Updates

Orders are automatically checked for status updates:

1. **Background Job**: Runs every 2 minutes
2. **Processing Orders**: Checks orders with `PROCESSING` status
3. **Provider Query**: Queries provider API for status
4. **Status Update**: Updates local status based on provider response
5. **Refund Processing**: Automatically refunds failed/cancelled orders

### Idempotency

Orders support idempotency to prevent duplicate orders:

```javascript
{
  idempotencyKey: "unique-request-id"
}
```

If an order with the same `idempotencyKey` exists, the existing order is returned instead of creating a new one.

## Provider Integration

### Provider Architecture

```
┌─────────────────────────────────┐
│      Provider Factory          │
│   (createProviderClient)       │
└──────────────┬──────────────────┘
               │
       ┌───────┴───────┐
       │               │
       ▼               ▼
┌──────────────┐ ┌──────────────┐
│ ShehabiClient│ │ TempoClient  │
└──────────────┘ └──────────────┘
       │               │
       └───────┬───────┘
               │
               ▼
┌─────────────────────────────────┐
│      Base Provider Client       │
│   (providerFetch + error handling)│
└─────────────────────────────────┘
```

### Provider Methods

Each provider client implements:

- `getProfile()` - Get provider balance
- `getProducts()` - Get available products
- `createOrder()` - Create a new order
- `checkOrders()` - Check order statuses

### Shehabi Integration

**Base URL**: `https://api.alshahen-store.com/`

**Authentication**: `api-token` header

**Supported Products**:
- MTN mobile services
- Syriatel mobile services
- Cash top-ups
- Bill payments
- Wholesale services

### Tempo Integration

**Base URL**: `https://api.tempo-card.com/`

**Authentication**: `api-token` header

**Supported Products**:
- Digital services
- Game credits
- Various online services

## Balance Management

### Balance Operations

All balance operations use transactions for audit trails:

```javascript
// Debit user balance
adjustUserBalance({
  userId,
  amount,
  type,
  performedBy,
  order,
  idempotencyKey,
  description,
  metadata,
  session
})

// Debit provider balance
adjustProviderBalance({
  providerId,
  amount,
  type,
  performedBy,
  order,
  idempotencyKey,
  description,
  metadata,
  session
})
```

### Optimistic Locking

Balance operations use optimistic locking to prevent race conditions:

```javascript
{
  balance: Decimal128,
  balanceVersion: Number  // Incremented on each change
}
```

### Transaction Types

- `agent_deposit` - Deposit to agent balance
- `agent_withdraw` - Withdrawal from agent balance
- `service_order` - Service order expense
- `order_refund` - Refund for failed order
- `balance_adjustment` - Manual adjustment
- `external_provider_debit` - Provider cost
- `external_provider_credit` - Provider refund
- `client_deposit` - Deposit to client
- `client_withdraw` - Withdrawal from client

## Background Jobs

### Order Status Check Job

A background job runs every 2 minutes to check order statuses:

```javascript
export function startOrderStatusCheckJob() {
  // Run immediately
  checkOrderStatuses();
  
  // Run every 2 minutes
  setInterval(checkOrderStatuses, 2 * 60 * 1000);
}
```

**Process:**
1. Find all orders with `PROCESSING` status
2. Group orders by provider
3. Query provider API for status updates
4. Update local order status
5. Process refunds for failed/cancelled orders
6. Increment status check attempts
7. Stop checking after 10 attempts

## Error Handling

### Error Handling Strategy

The application uses a centralized error handling middleware:

```javascript
export function errorHandler(err, req, res, next) {
  // Log error
  console.error(err);
  
  // Handle specific error types
  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors
    });
  }
  
  if (err instanceof AuthenticationError) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
}
```

### Custom Error Classes

- `ValidationError` - Input validation errors
- `AuthenticationError` - Authentication failures
- `AuthorizationError` - Authorization failures
- `NotFoundError` - Resource not found
- `ProviderError` - Provider API errors

## Security Considerations

### Password Security

- **Hashing**: Passwords are hashed using bcrypt (12 rounds)
- **Salting**: bcrypt automatically handles salting
- **Storage**: Only password hashes are stored, never plain text

### Token Security

- **Secret Keys**: JWT secrets are stored in environment variables
- **Token Storage**: Refresh tokens are hashed before storage
- **Token Expiry**: Access tokens expire after 15 minutes
- **Refresh Rotation**: New refresh tokens are issued on refresh

### API Security

- **Rate Limiting**: Authentication endpoints limited to 30 requests per 15 minutes
- **CORS**: Configured for specific origins
- **Helmet**: Security headers for HTTP
- **MongoDB Sanitization**: Protection against NoSQL injection
- **Input Validation**: All inputs are validated

### Provider Credentials

- **Encryption**: Provider API tokens are encrypted
- **Storage**: Encrypted credentials stored in database
- **Access**: Credentials are excluded from JSON responses

## Performance Optimization

### Database Indexing

Strategic indexes are used for query optimization:

```javascript
// User indexes
userSchema.index({ email: 1 });
userSchema.index({ integerId: 1 });
userSchema.index({ role: 1, isActive: 1 });

// Order indexes
orderSchema.index({ performedBy: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ externalOrderUuid: 1 });

// Service indexes
serviceSchema.index({ externalProvider: 1, isActive: 1 });
```

### Pagination

All list endpoints support pagination to limit data transfer:

```javascript
{
  page: 1,
  limit: 20,
  total: 100,
  totalPages: 5
}
```

### Caching

- **Exchange Rate**: Active rate is cached in memory
- **Provider Balances**: Balances are cached and synced periodically
- **Merged Products**: Product catalog is cached for quick access

### Connection Pooling

MongoDB connection pooling is configured for optimal performance:

```javascript
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 2,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000
});
```

## Monitoring & Logging

### Logging Strategy

- **Error Logging**: All errors are logged to console
- **Transaction Logging**: All financial operations are logged
- **Order Status Logging**: Order status checks are logged

### Health Check

A health check endpoint is available:

```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "OK"
}
```

## Deployment Considerations

### Environment Variables

All sensitive configuration is stored in environment variables:

```env
MONGODB_URI=mongodb://localhost:27017/sayed
JWT_SECRET=your-secret-key
SHEHABI_API_TOKEN=your-shehabi-token
TEMPO_API_TOKEN=your-tempo-token
```

### Process Management

For production deployment, use PM2:

```bash
pm2 start src/server.js --name sayed-backend
pm2 startup
pm2 save
```

### Database Backups

Regular MongoDB backups are essential:

```bash
# Backup
mongodump --uri="mongodb://localhost:27017/sayed" --out=/backup/path

# Restore
mongorestore --uri="mongodb://localhost:27017/sayed" /backup/path
```

## Future Enhancements

### Planned Features

- **WebSocket Integration**: Real-time order status updates
- **Analytics Dashboard**: Business intelligence and reporting
- **Multi-Currency Support**: Additional currency options
- **Advanced Rate Limiting**: Per-user rate limiting
- **API Versioning**: Support for multiple API versions
- **Webhook Support**: Event notifications to external systems

### Scalability Considerations

- **Horizontal Scaling**: Stateless design allows multiple instances
- **Load Balancing**: Can be deployed behind a load balancer
- **Database Sharding**: MongoDB supports horizontal scaling
- **Caching Layer**: Redis can be added for improved caching
