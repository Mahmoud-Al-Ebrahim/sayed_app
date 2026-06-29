# Installation Guide

This guide provides step-by-step instructions for setting up and running the Sayed Backend platform.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher
- **MongoDB**: Version 4.4 or higher
- **Git**: For cloning the repository
- **npm**: Comes with Node.js

### Verify Prerequisites

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check MongoDB installation
mongod --version
```

## Installation Steps

### 1. Clone the Repository

Clone the project from your repository:

```bash
git clone <repository-url>
cd sayed
```

### 2. Install Dependencies

Install all required npm packages:

```bash
npm install
```

This will install the following dependencies:
- express - Web framework
- mongoose - MongoDB ODM
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- google-auth-library - Google OAuth
- cors - Cross-origin resource sharing
- helmet - Security headers
- express-rate-limit - Rate limiting
- express-mongo-sanitize - MongoDB injection protection
- dotenv - Environment variable management
- validator - Input validation

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/sayed

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Shehabi Provider Configuration
SHEHABI_API_TOKEN=your-shehabi-api-token
SHEHABI_BASE_URL=https://api.alshahen-store.com/

# Tempo Provider Configuration
TEMPO_API_TOKEN=your-tempo-api-token
TEMPO_BASE_URL=https://api.tempo-card.com/
```

### 4. Setup MongoDB

#### Option A: Local MongoDB Installation

If you have MongoDB installed locally, start the MongoDB service:

**Windows:**
```bash
net start MongoDB
```

**Linux/Mac:**
```bash
sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/sayed?retryWrites=true&w=majority
```

### 5. Seed Initial Data

The application includes a seed script to create an initial admin user:

```bash
node src/bootstrap/seedAdmin.js
```

This will create:
- Admin user with email: `admin@sayed.com`
- Default password: `Admin123!` (change this immediately)

**⚠️ Important**: Change the default admin password after first login.

### 6. Start the Server

#### Development Mode

For development with hot-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000` and automatically restart when you make changes.

#### Production Mode

For production deployment:

```bash
npm start
```

### 7. Verify Installation

Check that the server is running:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "message": "OK"
}
```

## Configuration Options

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 3000 | No |
| `NODE_ENV` | Environment (development/production) | development | No |
| `MONGODB_URI` | MongoDB connection string | - | Yes |
| `JWT_SECRET` | Secret for JWT signing | - | Yes |
| `JWT_REFRESH_SECRET` | Secret for refresh token signing | - | Yes |
| `JWT_EXPIRES_IN` | Access token expiry | 15m | No |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | 7d | No |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | - | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | - | No |
| `GOOGLE_REDIRECT_URI` | Google OAuth redirect URI | - | No |
| `SHEHABI_API_TOKEN` | Shehabi API token | - | Yes* |
| `SHEHABI_BASE_URL` | Shehabi API base URL | https://api.alshahen-store.com/ | No |
| `TEMPO_API_TOKEN` | Tempo API token | - | Yes* |
| `TEMPO_BASE_URL` | Tempo API base URL | https://api.tempo-card.com/ | No |

*Required if using the respective provider

## Provider Setup

### Shehabi Provider

1. Register for a Shehabi account at https://api.alshahen-store.com/
2. Obtain your API token from the dashboard
3. Add the API token to your `.env` file
4. Sync provider products via the admin API

### Tempo Provider

1. Register for a Tempo account at https://api.tempo-card.com/
2. Obtain your API token from the dashboard
3. Add the API token to your `.env` file
4. Sync provider products via the admin API

## Troubleshooting

### MongoDB Connection Issues

**Error**: `MongooseServerSelectionError`

**Solution**:
- Verify MongoDB is running
- Check `MONGODB_URI` in `.env`
- Ensure MongoDB credentials are correct

### Port Already in Use

**Error**: `EADDRINUSE: address already in use`

**Solution**:
- Change the `PORT` in `.env`
- Or kill the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  
  # Linux/Mac
  lsof -ti:3000 | xargs kill -9
  ```

### JWT Errors

**Error**: `JsonWebTokenError: invalid signature`

**Solution**:
- Ensure `JWT_SECRET` is set in `.env`
- Restart the server after changing environment variables

### Provider Sync Issues

**Error**: Provider sync fails

**Solution**:
- Verify API tokens are correct
- Check provider service is accessible
- Review provider API documentation

## Production Deployment

### Using PM2 (Recommended)

1. Install PM2 globally:
```bash
npm install -g pm2
```

2. Start the application:
```bash
pm2 start src/server.js --name sayed-backend
```

3. Configure PM2 to start on boot:
```bash
pm2 startup
pm2 save
```

### Using Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
```

Build and run:

```bash
docker build -t sayed-backend .
docker run -p 3000:3000 --env-file .env sayed-backend
```

### Environment-Specific Configurations

For production, ensure:

- `NODE_ENV=production`
- Use strong, randomly generated secrets
- Enable HTTPS
- Configure proper CORS settings
- Set up monitoring and logging
- Use a production MongoDB instance

## Security Considerations

1. **Never commit `.env` file** to version control
2. **Use strong secrets** for JWT keys
3. **Change default passwords** immediately
4. **Enable HTTPS** in production
5. **Keep dependencies updated** with `npm audit fix`
6. **Use environment-specific configurations**
7. **Implement proper backup strategies** for MongoDB

## Next Steps

After installation:

1. Login as admin and change the default password
2. Configure external providers (Shehabi, Tempo)
3. Sync provider products
4. Create agent accounts
5. Set up badges and profit margins
6. Configure exchange rates

For API documentation, see:
- [Client API](API_CLIENT.md)
- [Agent API](API_AGENT.md)
- [Admin API](API_ADMIN.md)
