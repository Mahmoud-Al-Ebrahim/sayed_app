import { Router } from 'express';
import { authenticate, requireAuthenticated, requireOwnDataOrAdmin } from '../middleware/auth.js';
import * as clientController from '../controllers/client.controller.js';

const router = Router();

router.use(authenticate, requireAuthenticated);

router.post('/orders', clientController.placeOrder);
router.get('/orders', clientController.listOrders);
router.get('/orders/:id', clientController.getOrder);
router.post('/orders/:id/refresh', clientController.refreshOrderStatus);

// Clients can only see their own transactions, agents and admins can see all
router.get('/transactions', clientController.listTransactions);

export default router;
