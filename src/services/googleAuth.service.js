import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';
import { msg } from '../constants/messages.js';

const client = new OAuth2Client(env.google.clientId);

/**
 * Verify a Google ID token from the mobile/web app.
 * @param {string} idToken — obtained from Google Sign-In on the client
 * @returns {{ googleId, email, name, emailVerified }}
 */
export async function verifyGoogleIdToken(idToken) {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error(msg.GOOGLE_TOKEN_REQUIRED);
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.google.clientId,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error(msg.GOOGLE_TOKEN_INVALID);
  }

  if (!payload.email) {
    throw new Error(msg.GOOGLE_EMAIL_REQUIRED);
  }

  if (payload.email_verified === false) {
    throw new Error(msg.GOOGLE_EMAIL_NOT_VERIFIED);
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name || payload.email.split('@')[0],
    emailVerified: payload.email_verified,
    picture: payload.picture,
  };
}
