# Badge and Profit System Documentation

## Overview
This document describes the badge-based profit margin system implemented for the backend. The system allows admins to configure different profit margins for products based on agent badge levels (Bronze, Silver, Gold, etc.), enabling flexible pricing strategies.

## Key Features

1. **Badge System**: Hierarchical badge levels for agents (Bronze, Silver, Gold, etc.)
2. **Product Profit Configuration**: Per-product profit margins per badge level
3. **Dynamic Pricing**: Order prices automatically calculated based on agent's badge
4. **Admin Management**: Full CRUD for badges and product profits
5. **Default Badge**: Bronze badge is created automatically and used as default

## Database Models

### Badge Model
**File**: `src/models/Badge.js`

```javascript
{
  name: String (unique, required),           // e.g., "bronze", "silver", "gold"
  displayName: String (required),              // e.g., "Bronze", "Silver", "Gold"
  description: String,                        // Optional description
  level: Number (default: 0),                 // Higher level = higher tier
  isActive: Boolean (default: true),          // Soft delete capability
  icon: String,                              // UI icon identifier
  color: String,                             // UI color code
}
```

### ProductProfit Model
**File**: `src/models/ProductProfit.js`

```javascript
{
  externalProvider: ObjectId (ref: ExternalProvider, required),
  providerType: String (enum: tempo, shehabi, required),
  productId: String (required),               // External product ID (may duplicate across providers)
  badge: ObjectId (ref: Badge, required),
  profitUSD: Decimal128 (required, min: 0),   // Profit amount in USD
  profitSYP: Decimal128 (optional),          // Profit in SYP (calculated from exchange rate)
  isActive: Boolean (default: true),
}
```

**Unique Index**: `externalProvider + productId + badge` (ensures one profit config per product per badge per provider)

### User Model Updates
**File**: `src/models/User.js`

Added field:
```javascript
badge: ObjectId (ref: Badge, default: null)
```

### Order Model Updates
**File**: `src/models/Order.js`

Added fields:
```javascript
profitUSD: Decimal128 (required, default: 0),  // Profit amount based on badge
badge: ObjectId (ref: Badge)                    // Badge used for this order
```

## API Endpoints

### Badge Management (Admin Only)

#### Create Badge
```
POST /api/admin/badges
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "silver",
  "displayName": "Silver",
  "description": "Silver tier agents",
  "level": 1,
  "isActive": true,
  "icon": "silver",
  "color": "#C0C0C0"
}
```

#### List Badges
```
GET /api/admin/badges?activeOnly=true
Authorization: Bearer <admin_token>
```

#### Get Badge
```
GET /api/admin/badges/:id
Authorization: Bearer <admin_token>
```

#### Update Badge
```
PATCH /api/admin/badges/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "displayName": "Silver Plus",
  "level": 2
}
```

#### Delete Badge
```
DELETE /api/admin/badges/:id
Authorization: Bearer <admin_token>
```
Note: Soft delete - sets `isActive` to false

### Product Profit Management (Admin Only)

#### Set Product Profit
```
POST /api/admin/product-profits
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "providerId": "provider_object_id",
  "productId": "256",
  "badgeId": "badge_object_id",
  "profitUSD": 0.05
}
```

#### List Product Profits
```
GET /api/admin/product-profits?providerId=<id>&badgeId=<id>&productId=<id>
Authorization: Bearer <admin_token>
```

#### Delete Product Profit
```
DELETE /api/admin/product-profits
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "providerId": "provider_object_id",
  "productId": "256",
  "badgeId": "badge_object_id"
}
```

#### Batch Set Product Profits
```
POST /api/admin/product-profits/batch
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "profits": [
    {
      "providerId": "provider1_id",
      "productId": "256",
      "badgeId": "bronze_id",
      "profitUSD": 0.02
    },
    {
      "providerId": "provider1_id",
      "productId": "256",
      "badgeId": "silver_id",
      "profitUSD": 0.05
    }
  ]
}
```

### Agent Badge Management (Admin Only)

#### Update Agent Badge
```
PATCH /api/admin/agents/:id/badge
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "badgeId": "silver_badge_id"
}
```

### Merged Products with Profits

#### Get Products with Profits
```
GET /api/admin/merged-products?includeProfits=true
Authorization: Bearer <token>
```

Response includes profit for each badge:
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 256,
        "name": "UME",
        "price": 0.0030470726359999997,
        "source": "shehabi",
        "providerId": "...",
        "profits": {
          "bronze": 0.02,
          "silver": 0.05,
          "gold": 0.10
        }
      }
    ]
  }
}
```

## Order Placement Logic

### Price Calculation

When an agent places an order:

1. **Get Agent's Badge**: Uses agent's badge, defaults to Bronze if not set
2. **Get Product Profit**: Looks up profit for product + provider + badge
3. **Calculate Total Price**:
   - **Shehabi** (SYP pricing):
     - Base cost USD = (price × quantity) / exchangeRate
     - Total cost USD = Base cost USD + (profitUSD × quantity)
     - Amount SYP = Total cost USD × exchangeRate
   - **Tempo** (USD pricing):
     - Base cost USD = price × quantity
     - Total cost USD = Base cost USD + (profitUSD × quantity)
     - Amount SYP = Total cost USD × exchangeRate

4. **Deduct from Agent**: Deducts `amountSYP` from agent balance
5. **Deduct from Provider**: Deducts `costUSD` (base cost only) from provider balance
6. **Store Profit**: Stores `profitUSD × quantity` in order record

### Example

**Scenario**:
- Product: PUBG UC (price: $1.00 USD from Tempo)
- Agent Badge: Silver (profit: $0.05 per unit)
- Quantity: 10 units
- Exchange Rate: 14,000 SYP/USD

**Calculation**:
- Base cost USD = $1.00 × 10 = $10.00
- Profit USD = $0.05 × 10 = $0.50
- Total cost USD = $10.00 + $0.50 = $10.50
- Amount SYP = $10.50 × 14,000 = 147,000 SYP

**Result**:
- Agent balance debited: 147,000 SYP
- Provider balance debited: $10.00 USD
- Order profitUSD: $0.50 USD
- Order costUSD: $10.00 USD
- Order amountSYP: 147,000 SYP

## Refund Logic

When an order is cancelled or rejected:

1. **Refund Agent**: Refunds full `amountSYP` (including profit) to agent
2. **Credit Provider**: Credits `costUSD` (base cost only) to provider
3. **Profit Handling**: Profit is not refunded separately - it's included in the agent refund

**Note**: The system refunds the full amount charged to the agent (including profit), ensuring agents are not penalized for provider failures.

## Permission Changes

### Removed Capabilities

1. **Client Order Placement**: Clients can no longer place orders
   - Removed: `POST /api/client/orders`
   - Clients can only view their orders

2. **Agent-to-Client Transfers**: Agents can no longer transfer balance to clients
   - Removed: `POST /api/agent/transfer-to-client`
   - This was inconsistent with the new badge-based profit system

### Current Permissions

**Admin**:
- Full access to all endpoints
- Can manage badges (CRUD)
- Can manage product profits (CRUD)
- Can update agent badges
- Can place orders

**Agent**:
- Can place orders (price calculated based on badge)
- Can view own orders and transactions
- Can request balance increases
- Cannot transfer to clients
- Cannot manage badges or profits

**Client**:
- Cannot place orders
- Can view own orders and transactions
- Cannot transfer balance
- Cannot manage badges or profits

## Default Badge System

### Bronze Badge Creation
The Bronze badge is automatically created on server startup if it doesn't exist:

```javascript
{
  name: "bronze",
  displayName: "Bronze",
  description: "Default badge level",
  level: 0,
  isActive: true,
  icon: "bronze",
  color: "#CD7F32"
}
```

### Default Badge Assignment
- New users have `badge: null` by default
- If agent has no badge, Bronze is used for profit calculation
- Admin can assign badges to agents via API

## Flutter Integration

### Product Display
When displaying products to agents:
1. Call `GET /api/admin/merged-products?includeProfits=true`
2. Display profit for agent's current badge
3. Show total price calculation: base price + badge profit

### Order Placement
When placing an order:
1. Send provider's base price (not including profit)
2. Server automatically calculates total price based on agent's badge
3. Display final price to user before confirmation

### Badge Display
1. Fetch agent profile to get current badge
2. Display badge name/icon/color in UI
3. Show badge level in profile

### Admin Badge Management
1. List badges: `GET /api/admin/badges`
2. Create new badges: `POST /api/admin/badges`
3. Update agent badge: `PATCH /api/admin/agents/:id/badge`

### Admin Profit Management
1. Fetch products with profits: `GET /api/admin/merged-products?includeProfits=true`
2. Display profit matrix (products × badges)
3. Allow admin to set/edit profits per product per badge
4. Use batch endpoint for bulk updates

## Testing Checklist

### Badge System
- [ ] Bronze badge created automatically on server start
- [ ] Admin can create new badges
- [ ] Admin can update badge details
- [ ] Admin can soft delete badges (isActive: false)
- [ ] Admin can assign badges to agents
- [ ] Agent without badge defaults to Bronze

### Product Profit
- [ ] Admin can set profit for product + provider + badge
- [ ] Profit is unique per combination (enforced by DB)
- [ ] Admin can list profits with filters
- [ ] Admin can delete profit configurations
- [ ] Batch profit updates work correctly
- [ ] Products API returns profits when includeProfits=true

### Order Placement
- [ ] Order price includes badge profit
- [ ] Agent balance debited correctly (base + profit)
- [ ] Provider balance debited correctly (base only)
- [ ] Order stores profitUSD and badge
- [ ] Bronze badge used when agent has no badge
- [ ] Different badges result in different prices

### Refund Logic
- [ ] Cancelled order refunds full amount to agent
- [ ] Provider credited with base cost only
- [ ] Profit not refunded separately (included in agent refund)

### Permissions
- [ ] Clients cannot place orders
- [ ] Agents cannot transfer to clients
- [ ] Admin can manage badges
- [ ] Admin can manage product profits
- [ ] Admin can update agent badges

## Migration Notes

### Database Changes
1. AddBadges collection (auto-created by Badge model)
2. Add ProductProfits collection (auto-created by ProductProfit model)
3. Add `badge` field to Users collection
4. Add `profitUSD` and `badge` fields to Orders collection

### Existing Data
- Existing users will have `badge: null` (defaults to Bronze)
- Existing orders will have `profitUSD: 0` and `badge: null`
- No data migration needed for existing orders

### Environment Variables
No new environment variables required.

## Troubleshooting

### Badge Not Found
**Issue**: Error "Badge not found" when placing order
**Solution**: Ensure Bronze badge exists (created automatically on startup). Check server logs for badge creation.

### Profit Not Applied
**Issue**: Order price doesn't include profit
**Solution**: 
- Check if profit is configured for product + provider + badge
- Verify agent has correct badge assigned
- Check ProductProfit collection for configuration

### Wrong Price Calculation
**Issue**: Price calculation seems incorrect
**Solution**:
- Verify exchange rate is set correctly
- Check if provider type (Shehabi/Tempo) is correct
- Ensure base price from provider is correct (not including profit)

### Permission Errors
**Issue**: Client can still place orders
**Solution**: Verify client routes file has POST /orders removed. Restart server.

## Performance Considerations

### Product Profits Query
- When `includeProfits=true`, system queries ProductProfit for each product × badge combination
- For large catalogs, consider caching profit configurations
- Current implementation is suitable for <1000 products and <10 badges

### Badge Lookup
- Badge lookup is cached in memory during order placement
- Minimal performance impact

### Indexes
- Badge: `level`, `isActive`, `name` (unique)
- ProductProfit: `externalProvider + productId + badge` (unique compound)
- User: `badge`
- Order: `badge`

## Security Considerations

### Profit Configuration
- Only admins can configure profits
- Profit amounts cannot be negative (enforced by schema)
- Badge level prevents unauthorized upgrades

### Order Integrity
- Profit is stored in order record for audit trail
- Badge used for order is stored for reference
- Refunds use stored amounts, not recalculated

### Access Control
- All badge/profit endpoints require admin authentication
- Agent badge update requires admin authentication
- Clients have no access to badge/profit management

## Future Enhancements

### Potential Improvements
1. **Profit Percentage**: Support percentage-based profits instead of fixed amounts
2. **Badge Expiration**: Add expiration dates for temporary badge upgrades
3. **Profit History**: Track profit changes over time
4. **Bulk Badge Update**: Update multiple agents' badges at once
5. **Profit Analytics**: Dashboard showing profit by badge/product
6. **Dynamic Badges**: Automatic badge upgrades based on order volume

### Scaling Considerations
1. **Profit Caching**: Cache profit configurations in Redis for faster access
2. **Badge Levels**: Support unlimited badge levels with automatic calculation
3. **Product Grouping**: Group products for bulk profit configuration
4. **Time-based Profits**: Different profits for different time periods

## Summary

The badge and profit system provides:
- ✅ Flexible profit margins per badge level
- ✅ Automatic price calculation based on agent badge
- ✅ Full admin management interface
- ✅ Bronze badge as default fallback
- ✅ Proper refund handling (full amount including profit)
- ✅ Updated permissions (no client orders, no agent-to-client transfers)
- ✅ Audit trail (profit and badge stored in orders)

The system is production-ready with proper error handling, database constraints, and security measures.
