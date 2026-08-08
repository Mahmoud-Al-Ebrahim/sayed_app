# Badge-Based Pricing API Documentation

## Overview

The Sayed platform uses a badge-based pricing system where each service has different sell prices depending on the client's badge level. This document explains the implementation and how to use it in your Flutter application.

## Badge System

### Badge Levels

Badges are hierarchical levels that determine pricing tiers:
- **Bronze** (level 0): Default badge for all new clients
- **Silver** (level 1): Higher tier with better prices
- **Gold** (level 2): Premium tier with best prices
- Additional badges can be added as needed

### Badge Assignment

- Every client is automatically assigned the **Bronze** badge upon registration
- Admins can manually change a client's badge through the admin panel
- The badge is stored in the `badge` field of the User model

## API Changes

### 1. User Profile Response

The user profile now includes the assigned badge information:

**Login/Register Response:**
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
      "badge": {
        "id": "badge_id",
        "name": "bronze",
        "displayName": "Bronze",
        "level": 0,
        "isActive": true
      }
    }
  }
}
```

**Get Profile Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "badge": {
        "id": "badge_id",
        "name": "bronze",
        "displayName": "Bronze",
        "level": 0,
        "isActive": true
      }
    }
  }
}
```

### 2. Services API - Client View

**Endpoint:** `GET /client/services?includeProfits=true`

**Response Structure:**
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

**Key Points:**
- `badgePrices` array contains **only one item** - the price for the client's badge
- For Shehabi products: `sellPriceSYP` is populated
- For Tempo products: `sellPriceUSD` is populated
- If no price is configured for the client's badge, the price field will be `null`

### 3. Services API - Admin View

**Endpoint:** `GET /admin/services?includeProfits=true`

**Response Structure:**
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

**Key Points:**
- `badgePrices` array contains **all active badges** with their respective prices
- Admins can see pricing for all badge levels
- Useful for managing and comparing pricing across different tiers

## Flutter Implementation Guide

### 1. Update User Model

```dart
class User {
  String id;
  int integerId;
  String email;
  String name;
  String role;
  double balance;
  int balanceVersion;
  bool isActive;
  bool isBlocked;
  Badge? badge; // NEW: User's assigned badge
  DateTime? lastLoginAt;
  DateTime createdAt;
}

class Badge {
  String id;
  String name; // "bronze", "silver", "gold"
  String displayName; // "Bronze", "Silver", "Gold"
  String? description;
  int level; // Higher level = higher tier
  bool isActive;
  String? icon;
  String? color;
  DateTime createdAt;
  DateTime updatedAt;
}
```

### 2. Update Product Model

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
  String productType;
  List<dynamic> params;
  QuantityRules? quantityRules;
  String pricingType;
  List<BadgePrice> badgePrices; // NEW: Badge-specific pricing
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
```

### 3. Display Price in Flutter

For clients, extract the price from the single badge price entry:

```dart
double? getProductPrice(Product product) {
  if (product.badgePrices.isEmpty) return null;
  
  final badgePrice = product.badgePrices.first;
  
  if (product.source == 'shehabi') {
    return badgePrice.sellPriceSYP;
  } else {
    return badgePrice.sellPriceUSD;
  }
}

// Usage in UI
Text(
  'Price: ${getProductPrice(product)?.toStringAsFixed(2)} SYP',
  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
)
```

### 4. Display Badge Info in Profile

```dart
// In profile screen
if (user.badge != null) {
  Card(
    child: ListTile(
      leading: Icon(
        _getBadgeIcon(user.badge!.name),
        color: Color(int.parse(user.badge!.color?.replaceFirst('#', '0xFF') ?? '0xFFCD7F32')),
      ),
      title: Text(user.badge!.displayName),
      subtitle: Text(user.badge!.description ?? ''),
      trailing: Text('Level ${user.badge!.level}'),
    ),
  );
}

IconData _getBadgeIcon(String badgeName) {
  switch (badgeName.toLowerCase()) {
    case 'bronze':
      return Icons.military_tech;
    case 'silver':
      return Icons.workspace_premium;
    case 'gold':
      return Icons.emoji_events;
    default:
      return Icons.star;
  }
}
```

### 5. Handle Null Prices

If a price is not configured for the client's badge:

```dart
Widget buildProductCard(Product product) {
  final price = getProductPrice(product);
  
  return Card(
    child: ListTile(
      title: Text(product.name),
      subtitle: Text(product.category),
      trailing: price != null
          ? Text('${price.toStringAsFixed(2)} SYP')
          : Text('Price not available', style: TextStyle(color: Colors.grey)),
    ),
  );
}
```

## Backend Implementation Details

### Modified Files

1. **src/models/User.js**
   - Added pre-save hook to assign bronze badge by default

2. **src/services/mergedProducts.service.js**
   - Modified `getMergedProducts()` to accept `userRole` and `userBadgeId` parameters
   - Modified `addProfitsToProducts()` to return badge prices based on user role
   - Admin: Returns all badges with prices
   - Client: Returns only client's badge with price

3. **src/controllers/admin.controller.js**
   - Updated `listServices()` to pass `userRole='admin'`

4. **src/controllers/client.controller.js**
   - Updated `listServices()` to pass `userRole='client'` and `userBadgeId`

### Database Schema

**User Model:**
```javascript
badge: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Badge',
  default: null,
  index: true,
}
```

**ProductProfit Model:**
```javascript
{
  externalProvider: ObjectId,
  providerType: String,
  productId: String,
  badge: ObjectId,
  sellPriceUSD: Decimal128, // For Tempo
  sellPriceSYP: Decimal128, // For Shehabi
  isActive: Boolean
}
```

## Testing Checklist

- [ ] Verify new users get bronze badge automatically
- [ ] Verify client services API returns only client's badge price
- [ ] Verify admin services API returns all badge prices
- [ ] Verify Shehabi products return sellPriceSYP
- [ ] Verify Tempo products return sellPriceUSD
- [ ] Verify null handling when price not configured
- [ ] Test badge upgrade scenario (admin changes client badge)
- [ ] Verify Flutter app displays correct prices based on badge

## Migration Notes

### Existing Users

Users created before this change will have `badge: null`. To migrate existing users:

```javascript
// Run this script to assign bronze badge to existing users
import { User } from './models/User.js';
import { Badge } from './models/Badge.js';

async function migrateExistingUsers() {
  const bronzeBadge = await Badge.findOne({ name: 'bronze' });
  if (!bronzeBadge) {
    console.log('Bronze badge not found');
    return;
  }
  
  const result = await User.updateMany(
    { badge: null },
    { badge: bronzeBadge._id }
  );
  
  console.log(`Updated ${result.modifiedCount} users`);
}
```

### Existing Product Profits

The ProductProfit model already exists and stores badge-specific pricing. No migration needed for pricing data.

## Future Enhancements

Potential improvements to consider:
1. Badge upgrade rewards (e.g., after X orders, auto-upgrade badge)
2. Badge-specific promotions/discounts
3. Badge history tracking
4. Admin UI for bulk badge assignment
5. Badge expiration dates
