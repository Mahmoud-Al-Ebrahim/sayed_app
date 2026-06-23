import { Router } from 'express';
import { authenticate, requireAgentOrAdmin, requireAgent } from '../middleware/auth.js';
import * as agentController from '../controllers/agent.controller.js';

const router = Router();

router.use(authenticate, requireAgentOrAdmin);

router.post('/balance-requests', agentController.createBalanceRequest);
router.get('/balance-requests', agentController.listBalanceRequests);

router.get('/exchange-rate', agentController.getExchangeRate);
router.get('/services', agentController.listServices);

router.post('/orders', agentController.placeOrder);
router.get('/orders', agentController.listOrders);
router.get('/orders/:id', agentController.getOrder);
router.post('/orders/:id/refresh', agentController.refreshOrderStatus);

// Transfer to client is agent-only (clients cannot transfer)
router.post('/transfer-to-client', authenticate, requireAgent, agentController.transferToClient);

// Agents can only see their own transactions, admins can see all
router.get('/transactions', agentController.listTransactions);

export default router;
