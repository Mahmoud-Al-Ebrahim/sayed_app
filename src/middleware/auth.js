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

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked' });
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
export const requireClient = requireRole(ROLES.CLIENT);

// Middleware to allow all authenticated users
export const requireAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: msg.AUTH_REQUIRED });
  }
  next();
};

// Middleware to restrict access to own data (for agents and clients)
// Admins can access any data
export function requireOwnDataOrAdmin(req, res, next) {
  if (req.user.role === ROLES.ADMIN) {
    return next();
  }

  const targetUserId = req.params.id || req.params.userId || req.params.agentId || req.params.clientId;
  
  if (targetUserId && targetUserId !== req.user._id.toString()) {
    return res.status(403).json({ 
      success: false, 
      message: 'You can only access your own data' 
    });
  }

  next();
}

// Middleware to prevent clients from transferring to other users
export function preventClientTransfer(req, res, next) {
  if (req.user.role === ROLES.CLIENT) {
    const targetUserId = req.params.id || req.params.userId || req.params.agentId || req.params.clientId;
    
    if (targetUserId && targetUserId !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Clients can only transfer to themselves' 
      });
    }
  }
  next();
}
