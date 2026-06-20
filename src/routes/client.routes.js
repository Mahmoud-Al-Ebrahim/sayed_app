import { Router } from 'express';
import { authenticate, requireClient } from '../middleware/auth.js';
import * as clientController from '../controllers/client.controller.js';

const router = Router();

router.use(authenticate, requireClient);

router.post('/orders', clientController.placeOrder);
router.get('/orders', clientController.listOrders);
router.get('/orders/:id', clientController.getOrder);
router.post('/orders/:id/refresh', clientController.refreshOrderStatus);

router.get('/transactions', clientController.listTransactions);

export default router;
