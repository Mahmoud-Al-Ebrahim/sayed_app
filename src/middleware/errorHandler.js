import { msg } from '../constants/messages.js';

export function notFoundHandler(_req, res) {
  res.status(404).json({ success: false, message: msg.ROUTE_NOT_FOUND });
}

export function errorHandler(err, _req, res, _next) {
  let status = err.status || err.statusCode || 500;
  if (!err.status && !err.statusCode) {
    if (err.name === 'LedgerError') status = 400;
    if (err.name === 'ProviderError') status = 502;
    if (err.name === 'ValidationError') status = 400;
    if (err.code === 11000) status = 409;
  }

  let message = err.message || msg.INTERNAL_ERROR;
  if (err.code === 11000) {
    message = msg.DUPLICATE;
  } else if (err.name === 'ValidationError') {
    message = msg.VALIDATION_FAILED;
  } else if (err.name === 'CastError') {
    message = msg.INVALID_ID;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message,
    ...(err.code && { code: err.code }),
  });
}
