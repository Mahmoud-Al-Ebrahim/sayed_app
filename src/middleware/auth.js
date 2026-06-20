import { verifyAccessToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { ROLES } from '../constants/index.js';
import { msg } from '../constants/messages.js';

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: msg.AUTH_REQUIRED });
    }

    const token = header.slice(7);
    const payload = verifyAccessToken(token);

    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: msg.INVALID_USER });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: msg.INVALID_TOKEN });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: msg.FORBIDDEN });
    }
    next();
  };
}

export const requireAdmin = requireRole(ROLES.ADMIN);
export const requireAgent = requireRole(ROLES.AGENT);
export const requireClient = requireRole(ROLES.CLIENT);
