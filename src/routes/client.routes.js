import { Router } from 'express';
import { authenticate, requireAuthenticated, requireOwnDataOrAdmin } from '../middleware/auth.js';
import * as clientController from '../controllers/client.controller.js';

const router = Router();

router.use(authenticate, requireAuthenticated);

// Profile
router.get('/profile', clientController.getProfile);

// Orders
router.post('/orders', clientController.placeOrder);
router.get('/orders', clientController.listOrders);
router.get('/orders/:id', clientController.getOrder);
router.post('/orders/:id/refresh', clientController.refreshOrderStatus);

// Services
router.get('/services', clientController.listServices);

// Exchange rate
router.get('/exchange-rate', clientController.getExchangeRate);

// Transactions
router.get('/transactions', clientController.listTransactions);

// Agents (view only)
router.get('/agents', clientController.listAgents);

export default router;
