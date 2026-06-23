# Backend Permissions Documentation for Flutter App Integration

## Overview
This document describes the updated role-based permission system in the backend and provides guidance for updating the Flutter application to align with these changes.

## Role Permissions Summary

### 1. Admin Role
- **Full Access**: Can perform all operations in the system
- **Can**: 
  - Manage agents (create, update, deposit, withdraw)
  - Manage clients (list, upgrade to agent, deposit, withdraw)
  - View all transactions across all users
  - View all orders
  - Manage exchange rates
  - Manage providers and services
  - Manage provider deposits
  - Approve/reject balance requests
- **Cannot**: N/A (has full access)

### 2. Agent Role
- **Same as Admin EXCEPT**:
  - Cannot upgrade clients to agents
  - Cannot view other users' transactions (only their own)
- **Can**:
  - Place orders
  - View their own orders
  - View their own transactions
  - Transfer balance to clients
  - Request balance increases
  - View exchange rates
  - View services
  - Use client routes (same functionality as clients)
- **Cannot**:
  - Upgrade clients to agents
  - View other agents' or clients' transactions
  - Access admin-only endpoints

### 3. Client Role
- **Same as Agent EXCEPT**:
  - Cannot transfer money to other users
  - Cannot access other users' data
- **Can**:
  - Place orders
  - View their own orders
  - View their own transactions
  - View exchange rates
  - Use frontend-based service ordering (Shehabi/Tempo)
- **Cannot**:
  - Transfer money to other users
  - View other users' data
  - Access agent-only endpoints (transfer to client)
  - Access admin-only endpoints

## Backend API Changes

### New Middleware Functions
The following middleware functions have been added to `src/middleware/auth.js`:

1. **`requireAgentOrAdmin`**: Allows both agents and admins (but not clients)
2. **`requireAuthenticated`**: Allows all authenticated users
3. **`requireOwnDataOrAdmin`**: Restricts access to own data (agents/clients) or allows admins full access
4. **`preventClientTransfer`**: Prevents clients from transferring to other users

### Route Updates

#### Admin Routes (`/api/admin/*`)
- All routes remain admin-only (`requireAdmin`)
- Client upgrade endpoint (`/clients/:id/upgrade`) is explicitly admin-only

#### Agent Routes (`/api/agent/*`)
- Changed from `requireAgent` to `requireAgentOrAdmin`
- Transfer to client endpoint (`/transfer-to-client`) is agent-only
- All other endpoints allow both agents and admins

#### Client Routes (`/api/client/*`)
- Changed from `requireClient` to `requireAuthenticated`
- Allows all authenticated users (clients, agents, admins)
- Controllers already filter data by user ID for security

## Flutter App Updates Required

### 1. Update Authentication Middleware Handling
The Flutter app should handle the new permission structure:

```dart
// Update error handling for 403 Forbidden responses
if (response.statusCode == 403) {
  // User doesn't have permission for this action
  // Show appropriate message based on user role
}
```

### 2. Update UI Based on User Role

#### Admin UI
- Show all admin features (already implemented)
- Ensure client upgrade button is only visible to admins
- Show provider deposits management

#### Agent UI
- Hide client upgrade functionality
- Show transfer to client feature
- Show balance request feature
- Use client routes for orders and transactions (same as clients)
- Hide admin-only features (agent management, client management, etc.)

#### Client UI
- Hide transfer to client feature
- Hide balance request feature
- Show only personal data (orders, transactions)
- Use client routes for all operations
- Hide agent and admin features

### 3. Update API Calls

#### Agent Feature Updates
The agent feature should now also use client routes for common operations:

```dart
// Agent can use client routes for:
- GET /api/client/orders
- GET /api/client/transactions
- POST /api/client/orders (frontend-based ordering)
```

#### Client Feature Updates
The client feature should remain as-is but ensure:

```dart
// Only client-specific operations:
- GET /api/client/orders
- GET /api/client/transactions
- POST /api/client/orders
- GET /api/client/exchange-rate
```

### 4. Update Bloc and Repository Logic

#### Admin Bloc
- No changes needed (already has full access)
- Ensure provider deposit operations are integrated

#### Agent Bloc
- Add client route integration for orders and transactions
- Keep transfer to client functionality
- Remove any client upgrade references

#### Client Bloc
- No changes needed (already restricted to own data)
- Ensure no transfer functionality is exposed

### 5. Update Navigation and Routing

#### Admin Navigation
- Keep all current admin routes
- Add provider deposits screen

#### Agent Navigation
- Remove client upgrade option
- Keep transfer to client option
- Add access to client-style order/transaction views
- Remove admin-only features

#### Client Navigation
- Keep current client routes
- Ensure no transfer options are visible
- Ensure no admin/agent features are accessible

### 6. Error Handling Updates

Add role-specific error messages:

```dart
String getPermissionErrorMessage(String userRole, String attemptedAction) {
  switch (userRole) {
    case 'agent':
      if (attemptedAction == 'upgrade_client') {
        return 'Only admins can upgrade clients to agents';
      }
      break;
    case 'client':
      if (attemptedAction == 'transfer') {
        return 'Clients cannot transfer money to other users';
      }
      if (attemptedAction == 'view_other_data') {
        return 'You can only view your own data';
      }
      break;
  }
  return 'You do not have permission for this action';
}
```

## Testing Checklist

### Admin Role Testing
- [ ] Can view all agents
- [ ] Can create/update agents
- [ ] Can deposit/withdraw from agents
- [ ] Can view all clients
- [ ] Can upgrade clients to agents
- [ ] Can deposit/withdraw from clients
- [ ] Can view all transactions
- [ ] Can view all orders
- [ ] Can manage exchange rates
- [ ] Can manage providers and services
- [ ] Can manage provider deposits
- [ ] Can approve/reject balance requests

### Agent Role Testing
- [ ] Can place orders
- [ ] Can view own orders
- [ ] Can view own transactions
- [ ] Can transfer to clients
- [ ] Can request balance increases
- [ ] Can view exchange rates
- [ ] Can view services
- [ ] Cannot upgrade clients to agents (should get 403)
- [ ] Cannot view other users' transactions (should get 403)
- [ ] Cannot access admin-only endpoints (should get 403)

### Client Role Testing
- [ ] Can place orders
- [ ] Can view own orders
- [ ] Can view own transactions
- [ ] Can view exchange rates
- [ ] Can use frontend-based ordering
- [ ] Cannot transfer to other users (should get 403)
- [ ] Cannot view other users' data (should get 403)
- [ ] Cannot access agent-only endpoints (should get 403)
- [ ] Cannot access admin-only endpoints (should get 403)

## Migration Notes

1. **Breaking Changes**: None - the changes are additive and backward compatible
2. **API Compatibility**: Existing API calls remain the same, but some now return 403 for unauthorized roles
3. **Flutter Impact**: UI needs to be updated to hide/show features based on user role
4. **Testing**: Thoroughly test all role-based access controls before deployment

## Summary

The backend now enforces strict role-based permissions:
- **Admin**: Full access to everything
- **Agent**: Same as admin except cannot upgrade clients or view others' transactions
- **Client**: Same as agent except cannot transfer money or access others' data

The Flutter app needs to be updated to:
1. Hide/show features based on user role
2. Handle 403 Forbidden responses appropriately
3. Ensure proper navigation based on role
4. Update error messages to be role-specific
