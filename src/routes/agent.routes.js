import { Router } from 'express';
import { authenticate, requireAgent } from '../middleware/auth.js';
import * as agentController from '../controllers/agent.controller.js';

const router = Router();

router.use(authenticate, requireAgent);

router.post('/balance-requests', agentController.createBalanceRequest);
router.get('/balance-requests', agentController.listBalanceRequests);

router.get('/exchange-rate', agentController.getExchangeRate);
router.get('/services', agentController.listServices);

router.post('/orders', agentController.placeOrder);
router.get('/orders', agentController.listOrders);
router.get('/orders/:id', agentController.getOrder);
router.post('/orders/:id/refresh', agentController.refreshOrderStatus);

router.post('/transfer-to-client', agentController.transferToClient);

router.get('/transactions', agentController.listTransactions);

export default router;
