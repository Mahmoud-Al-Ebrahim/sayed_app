import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  mongodbUri: requireEnv('MONGODB_URI'),
  jwt: {
    accessSecret: requireEnv('JWT_ACCESS_SECRET'),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  google: {
    clientId: requireEnv('GOOGLE_CLIENT_ID'),
  },
  bootstrapAdmin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    name: process.env.ADMIN_NAME || 'Admin',
    integerId: process.env.ADMIN_INTEGER_ID
  },
  encryptionKey: process.env.ENCRYPTION_KEY,
  providers: {
    tempo: {
      apiToken: process.env.TEMPO_API_TOKEN,
      baseUrl: process.env.TEMPO_BASE_URL || 'https://api.tempo-card.com',
    },
    shehabi: {
      apiToken: process.env.SHEHABI_API_TOKEN,
      baseUrl: process.env.SHEHABI_BASE_URL || 'https://api.alshahen-store.com',
    },
  },
};
