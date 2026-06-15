import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/agents', adminController.listAgents);
router.post('/agents', adminController.createAgent);
router.patch('/agents/:id', adminController.updateAgent);
router.post('/agents/:id/deposit', adminController.depositToAgent);
router.post('/agents/:id/withdraw', adminController.withdrawFromAgent);

router.get('/balance-requests', adminController.listBalanceRequests);
router.post('/balance-requests/:id/approve', adminController.approveBalanceRequest);
router.post('/balance-requests/:id/reject', adminController.rejectBalanceRequest);

router.get('/exchange-rate', adminController.getExchangeRate);
router.post('/exchange-rate', adminController.setExchangeRate);
router.get('/exchange-rates', adminController.listExchangeRates);

router.get('/providers', adminController.listProviders);
router.post('/providers', adminController.createProvider);
router.patch('/providers/:id', adminController.updateProvider);
router.post('/providers/:id/sync-balance', adminController.syncProviderBalance);
router.post('/providers/:id/sync-products', adminController.syncProviderProducts);

router.get('/services', adminController.listServices);
router.post('/services', adminController.createService);
router.patch('/services/:id', adminController.updateService);
router.delete('/services/:id', adminController.deleteService);

router.get('/transactions', adminController.listTransactions);
router.get('/orders', adminController.listOrders);
router.post('/orders', adminController.placeOrder);
router.post('/orders/:id/refresh', adminController.refreshOrderStatus);

export default router;
