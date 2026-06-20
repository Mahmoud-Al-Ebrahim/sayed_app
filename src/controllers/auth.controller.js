import * as authService from '../services/auth.service.js';
import { ROLES } from '../constants/index.js';
import { msg } from '../constants/messages.js';

export async function register(req, res, next) {
  try {
    const { email, name, password } = req.body;

    // Public registration creates clients only; admin and agents are created by admin
    const result = await authService.registerWithEmail({
      email,
      name,
      password,
      role: ROLES.CLIENT,
    });

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginWithEmail({ email, password });

    res.json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (err) {
    err.status = 401;
    next(err);
  }
}

export async function googleAuth(req, res, next) {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: msg.ID_TOKEN_REQUIRED });
    }

    const result = await authService.authenticateWithGoogle(idToken);

    res.json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (err) {
    err.status = 401;
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);

    res.json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (err) {
    err.status = 401;
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.json({ success: true, message: msg.LOGGED_OUT });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  res.json({ success: true, data: { user: req.user } });
}

export async function getProfileByIntegerId(req, res, next) {
  try {
    const { integerId } = req.params;
    const user = await authService.getUserByIntegerId(parseInt(integerId));
    
    if (!user) {
      return res.status(404).json({ success: false, message: msg.USER_NOT_FOUND });
    }

    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}
