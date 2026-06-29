import { Router } from 'express';
import { authenticate, requireAuthenticated, requireOwnDataOrAdmin } from '../middleware/auth.js';
import * as clientController from '../controllers/client.controller.js';

const router = Router();

router.use(authenticate, requireAuthenticated);

// Clients cannot place orders - only view their own orders
router.get('/orders', clientController.listOrders);
router.get('/orders/:id', clientController.getOrder);
router.post('/orders/:id/refresh', clientController.refreshOrderStatus);

// Clients can only see their own transactions
router.get('/transactions', clientController.listTransactions);

export default router;
