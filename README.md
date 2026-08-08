# Sayed Backend - Reseller Platform

A comprehensive backend system for managing service reselling operations, supporting clients and admins with balance management, order processing, and integration with external providers (Shehabi and Tempo).

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [User Roles](#user-roles)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [API Endpoints](#api-endpoints)
- [External Providers](#external-providers)

## 🎯 Overview

Sayed Backend is a Node.js/Express-based API that powers a reseller platform for digital services. The system enables:

- **Admins** to manage users, providers, services, balances, and the agent collection
- **Clients** to place orders, view services, track transactions, and view their profile

The platform integrates with external service providers (Shehabi and Tempo) to fulfill orders for mobile top-ups, game credits, and other digital services.

## ✨ Features

### Core Functionality
- **User Management**: Multi-role authentication (Admin, Client)
- **Agent Collection**: Manage agent information (name, address, phone, client reference)
- **Balance Management**: Track and manage balances in SYP and USD
- **Order Processing**: Place and track service orders with automatic status updates
- **Provider Integration**: Seamless integration with Shehabi and Tempo APIs
- **Transaction History**: Complete audit trail of all financial operations
- **Badge System**: Tiered profit margins based on badges
- **Exchange Rate Management**: Dynamic USD/SYP exchange rate handling
- **Automatic Refunds**: Automatic refund processing for failed/cancelled orders
- **Client Blocking**: Admin can block clients from accessing the API

### Security Features
- JWT-based authentication with refresh tokens
- Google OAuth integration
- Rate limiting on authentication endpoints
- Encrypted provider credentials
- Optimistic locking for balance operations
- Role-based access control

## 👥 User Roles

### Admin
Full system access including:
- Create and manage agent collection entries
- Manage clients (update password, block/unblock, view transactions)
- Search clients by name, phone, or integer ID
- Manage provider accounts and sync balances
- Configure services and pricing
- Set exchange rates
- View all transactions and orders
- Manage badges and profit margins

### Client
Full client capabilities:
- Place service orders
- View own orders and transactions
- Access service catalog
- View profile information
- Track order status
- View available agents

## 🛠 Technology Stack

- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Google OAuth
- **Security**: Helmet, CORS, Rate Limiting
- **External APIs**: Shehabi, Tempo

## 📁 Project Structure

```
sayed/
├── src/
│   ├── app.js                 # Express app configuration
│   ├── server.js              # Server entry point
│   ├── bootstrap/             # Database seeding
│   ├── config/                # Configuration files
│   ├── constants/             # Constants and enums
│   ├── controllers/            # Request handlers
│   ├── middleware/            # Custom middleware
│   ├── models/                # Mongoose models
│   ├── providers/             # External provider clients
│   ├── routes/                # API route definitions
│   ├── services/              # Business logic
│   └── utils/                 # Utility functions
├── .env                       # Environment variables
├── package.json              # Dependencies
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- MongoDB instance
- Shehabi API token (for provider integration)
- Tempo API token (for provider integration)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sayed
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the server:
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

For detailed installation instructions, see [docs/INSTALLATION.md](docs/INSTALLATION.md).

## 📚 Documentation

- [Installation Guide](docs/INSTALLATION.md) - Detailed setup instructions
- [Client API Documentation](docs/API_CLIENT.md) - Endpoints for clients
- [Admin API Documentation](docs/API_ADMIN.md) - Endpoints for admins
- [Architecture Documentation](docs/ARCHITECTURE.md) - System architecture and design
- [User Roles Guide](docs/USER_ROLES.md) - Detailed role permissions

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/google` - Google OAuth login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user profile

### Admin Endpoints
- `GET /admin/agent-collection` - List all agents in collection
- `POST /admin/agent-collection` - Create new agent entry
- `GET /admin/agent-collection/:id` - Get agent details
- `PATCH /admin/agent-collection/:id` - Update agent
- `DELETE /admin/agent-collection/:id` - Delete agent
- `GET /admin/clients` - List all clients
- `GET /admin/clients/:integerId` - Get client by integer ID
- `PATCH /admin/clients/:integerId/password` - Update client password
- `PATCH /admin/clients/:integerId/block` - Block client
- `PATCH /admin/clients/:integerId/unblock` - Unblock client
- `GET /admin/clients/:integerId/transactions` - View client transactions
- `GET /admin/providers` - List providers
- `POST /admin/providers` - Create provider
- `POST /admin/providers/:id/sync-products` - Sync provider products
- `GET /admin/services` - List services
- `POST /admin/services` - Create service
- `GET /admin/orders` - List all orders
- `POST /admin/orders` - Place order
- `GET /admin/transactions` - List all transactions

### Client Endpoints
- `GET /client/profile` - Get profile information
- `POST /client/orders` - Place order
- `GET /client/orders` - List own orders
- `GET /client/orders/:id` - Get order details
- `POST /client/orders/:id/refresh` - Refresh order status
- `GET /client/services` - List available services
- `GET /client/exchange-rate` - Get current exchange rate
- `GET /client/transactions` - List own transactions
- `GET /client/agents` - View available agents

## 🌐 External Providers

### Shehabi
- **Base URL**: https://api.alshahen-store.com/
- **Currency**: SYP (Syrian Pound)
- **Supported Products**: MTN and Syriatel mobile services, cash top-ups, bill payments

### Tempo
- **Base URL**: https://api.tempo-card.com/
- **Currency**: USD (US Dollar)
- **Supported Products**: Digital services and game credits

## 📝 License

[Your License Here]

## 🤝 Support

For support and questions, please contact [your support email].
