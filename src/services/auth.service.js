import validator from 'validator';
import { User } from '../models/User.js';
import { ROLES, AUTH_PROVIDERS } from '../constants/index.js';
import { msg } from '../constants/messages.js';
import { verifyGoogleIdToken } from './googleAuth.service.js';
import {
  signAccessToken,
  signRefreshToken,
  hashToken,
  getRefreshTokenExpiry,
  verifyRefreshToken,
} from '../utils/jwt.js';

const MAX_REFRESH_TOKENS = 5;

async function generateUniqueIntegerId() {
  let integerId;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    integerId = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit ID
    const existing = await User.findByIntegerId(integerId);
    if (!existing) {
      return integerId;
    }
    attempts++;
  } while (attempts < maxAttempts);

  throw new Error('Failed to generate unique integer ID after multiple attempts');
}

function validateEmail(email) {
  if (!email || !validator.isEmail(email)) {
    throw new Error(msg.EMAIL_REQUIRED);
  }
}

function validatePassword(password) {
  if (!password || password.length < 8) {
    throw new Error(msg.PASSWORD_MIN);
  }
}

function validateName(name) {
  if (!name || name.trim().length < 2) {
    throw new Error(msg.NAME_REQUIRED);
  }
}

async function issueTokens(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  user.refreshTokens.push({
    tokenHash: hashToken(refreshToken),
    expiresAt: getRefreshTokenExpiry(),
  });

  if (user.refreshTokens.length > MAX_REFRESH_TOKENS) {
    user.refreshTokens = user.refreshTokens.slice(-MAX_REFRESH_TOKENS);
  }

  user.lastLoginAt = new Date();
  await user.save();

  return { accessToken, refreshToken, user };
}

export async function registerWithEmail({ email, name, password, role = ROLES.AGENT }) {
  validateEmail(email);
  validateName(name);
  validatePassword(password);

  const existing = await User.findByEmail(email);
  if (existing) {
    throw new Error(msg.EMAIL_EXISTS);
  }

  const integerId = await generateUniqueIntegerId();

  const user = new User({
    integerId,
    email: email.toLowerCase().trim(),
    name: name.trim(),
    role,
    authProviders: [AUTH_PROVIDERS.LOCAL],
  });

  await user.setPassword(password);
  await user.save();

  return issueTokens(user);
}

/**
 * Google Sign-In / Sign-Up.
 * - New users are created as agents by default (admin is bootstrapped separately).
 * - If email exists with local auth, links Google to the account.
 */
export async function authenticateWithGoogle(idToken) {
  const googleUser = await verifyGoogleIdToken(idToken);

  let user = await User.findOne({
    $or: [{ googleId: googleUser.googleId }, { email: googleUser.email }],
  }).select('+refreshTokens +passwordHash');

  if (!user) {
    const integerId = await generateUniqueIntegerId();
    user = new User({
      integerId,
      email: googleUser.email,
      name: googleUser.name,
      googleId: googleUser.googleId,
      role: ROLES.CLIENT,
      authProviders: [AUTH_PROVIDERS.GOOGLE],
    });
    await user.save();
  } else {
    if (!user.isActive) {
      throw new Error(msg.ACCOUNT_DEACTIVATED);
    }

    if (!user.googleId) {
      user.googleId = googleUser.googleId;
    }
    if (!user.authProviders.includes(AUTH_PROVIDERS.GOOGLE)) {
      user.authProviders.push(AUTH_PROVIDERS.GOOGLE);
    }
    if (googleUser.name && user.name !== googleUser.name) {
      user.name = googleUser.name;
    }
  }

  return issueTokens(user);
}

export async function loginWithEmail({ email, password }) {
  validateEmail(email);

  const user = await User.findByEmail(email).select('+passwordHash +refreshTokens');
  if (!user || !user.isActive) {
    throw new Error(msg.INVALID_CREDENTIALS);
  }

  if (!user.passwordHash) {
    throw new Error(msg.USE_GOOGLE_SIGNIN);
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    throw new Error(msg.INVALID_CREDENTIALS);
  }

  return issueTokens(user);
}

export async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw new Error(msg.REFRESH_TOKEN_REQUIRED);
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new Error(msg.INVALID_REFRESH_TOKEN);
  }

  const user = await User.findById(payload.sub).select('+refreshTokens');
  if (!user || !user.isActive) {
    throw new Error(msg.USER_NOT_FOUND);
  }

  const tokenHash = hashToken(refreshToken);
  const stored = user.refreshTokens.find(
    (t) => t.tokenHash === tokenHash && t.expiresAt > new Date()
  );

  if (!stored) {
    throw new Error(msg.REFRESH_TOKEN_REVOKED);
  }

  return issueTokens(user);
}

export async function logout(refreshToken) {
  if (!refreshToken) return;

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return;
  }

  const user = await User.findById(payload.sub).select('+refreshTokens');
  if (!user) return;

  const tokenHash = hashToken(refreshToken);
  user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== tokenHash);
  await user.save();
}

export async function getUserByIntegerId(integerId) {
  const user = await User.findByIntegerId(integerId);
  if (!user) {
    throw new Error(msg.USER_NOT_FOUND);
  }
  return user;
}
