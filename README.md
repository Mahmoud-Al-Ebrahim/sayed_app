# Sayed Backend - Reseller Platform

A comprehensive backend system for managing service reselling operations, supporting agents, clients, and admins with balance management, order processing, and integration with external providers (Shehabi and Tempo).

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

- **Admins** to manage users, providers, services, and balances
- **Agents** to place orders, request balance deposits, and track transactions
- **Clients** to view their orders and transaction history

The platform integrates with external service providers (Shehabi and Tempo) to fulfill orders for mobile top-ups, game credits, and other digital services.

## ✨ Features

### Core Functionality
- **User Management**: Multi-role authentication (Admin, Agent, Client)
- **Balance Management**: Track and manage balances in SYP and USD
- **Order Processing**: Place and track service orders with automatic status updates
- **Provider Integration**: Seamless integration with Shehabi and Tempo APIs
- **Transaction History**: Complete audit trail of all financial operations
- **Badge System**: Tiered profit margins based on agent badges
- **Exchange Rate Management**: Dynamic USD/SYP exchange rate handling
- **Automatic Refunds**: Automatic refund processing for failed/cancelled orders

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
- Create and manage agents and clients
- Manage provider accounts and sync balances
- Configure services and pricing
- Approve/reject balance requests
- Set exchange rates
- View all transactions and orders
- Manage badges and profit margins

### Agent
Reseller capabilities:
- Place service orders
- Request balance deposits
- View own orders and transactions
- Access service catalog
- Track order status

### Client
End-user capabilities:
- View own orders
- View transaction history
- Track order status

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
- [Agent API Documentation](docs/API_AGENT.md) - Endpoints for agents
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
- `GET /admin/agents` - List all agents
- `POST /admin/agents` - Create new agent
- `PATCH /admin/agents/:id` - Update agent
- `POST /admin/agents/:id/deposit` - Deposit to agent balance
- `POST /admin/agents/:id/withdraw` - Withdraw from agent balance
- `GET /admin/clients` - List all clients
- `GET /admin/providers` - List providers
- `POST /admin/providers` - Create provider
- `POST /admin/providers/:id/sync-products` - Sync provider products
- `GET /admin/services` - List services
- `POST /admin/services` - Create service
- `GET /admin/orders` - List all orders
- `POST /admin/orders` - Place order
- `GET /admin/transactions` - List all transactions

### Agent Endpoints
- `POST /agent/balance-requests` - Request balance deposit
- `GET /agent/balance-requests` - List balance requests
- `GET /agent/services` - List available services
- `POST /agent/orders` - Place order
- `GET /agent/orders` - List own orders
- `GET /agent/orders/:id` - Get order details
- `GET /agent/transactions` - List own transactions

### Client Endpoints
- `GET /client/orders` - List own orders
- `GET /client/orders/:id` - Get order details
- `GET /client/transactions` - List own transactions

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
