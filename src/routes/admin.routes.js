import { Router } from 'express';
import { authenticate, requireAdmin, requireAgentOrAdmin, requireAuthenticated } from '../middleware/auth.js';
import * as adminController from '../controllers/admin.controller.js';
import * as mergedProductsController from '../controllers/mergedProducts.controller.js';
import * as badgeController from '../controllers/badge.controller.js';
import * as productProfitController from '../controllers/productProfit.controller.js';

const router = Router();

router.use(authenticate, requireAdmin);

// Admin-only endpoints
router.get('/agents', adminController.listAgents);
router.post('/agents', adminController.createAgent);
router.patch('/agents/:id', adminController.updateAgent);
router.post('/agents/:id/deposit', adminController.depositToAgent);
router.post('/agents/:id/withdraw', adminController.withdrawFromAgent);
router.patch('/agents/:id/badge', adminController.updateAgentBadge);

router.get('/clients', adminController.listClients);
// Client upgrade is admin-only
router.patch('/clients/:id/upgrade', adminController.upgradeClientToAgent);
router.post('/clients/:id/deposit', adminController.depositToClient);
router.post('/clients/:id/withdraw', adminController.withdrawFromClient);

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

router.get('/provider-deposits', adminController.listProviderDeposits);
router.post('/provider-deposits', adminController.createProviderDeposit);
router.get('/provider-deposits/:id', adminController.getProviderDeposit);
router.delete('/provider-deposits/:id', adminController.deleteProviderDeposit);

// Badge management
router.get('/badges', badgeController.listBadges);
router.post('/badges', badgeController.createBadge);
router.get('/badges/:id', badgeController.getBadge);
router.patch('/badges/:id', badgeController.updateBadge);
router.delete('/badges/:id', badgeController.deleteBadge);

// Product profit management
router.get('/product-profits', productProfitController.listProductProfits);
router.post('/product-profits', productProfitController.setProductProfit);
router.delete('/product-profits', productProfitController.deleteProductProfit);
router.post('/product-profits/batch', productProfitController.batchSetProductProfits);

// Merged products endpoint (available to all authenticated users)
router.get('/merged-products', authenticate, requireAuthenticated, mergedProductsController.listMergedProducts);
router.post('/merged-products/refresh', authenticate, requireAdmin, mergedProductsController.refreshProductsCache);

// Manual trigger for order status check (admin only)
router.post('/orders/check-status', authenticate, requireAdmin, mergedProductsController.triggerOrderStatusCheck);

export default router;
