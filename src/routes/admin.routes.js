import { Router } from 'express';
import { authenticate, requireAdmin, requireAuthenticated } from '../middleware/auth.js';
import * as adminController from '../controllers/admin.controller.js';
import * as agentCollectionController from '../controllers/agentCollection.controller.js';
import * as mergedProductsController from '../controllers/mergedProducts.controller.js';
import * as badgeController from '../controllers/badge.controller.js';
import * as productProfitController from '../controllers/productProfit.controller.js';
import * as notificationController from '../controllers/notification.controller.js';

const router = Router();

router.use(authenticate, requireAdmin);

// Agent collection management
router.get('/agent-collection', agentCollectionController.listAgents);
router.post('/agent-collection', agentCollectionController.createAgent);
router.get('/agent-collection/:id', agentCollectionController.getAgent);
router.patch('/agent-collection/:id', agentCollectionController.updateAgent);
router.delete('/agent-collection/:id', agentCollectionController.deleteAgent);

// Client management
router.get('/clients', adminController.listClients);
router.get('/clients/:integerId', adminController.getClientByIntegerId);
router.patch('/clients/:integerId/password', adminController.updateClientPassword);
router.patch('/clients/:integerId/block', adminController.blockClient);
router.patch('/clients/:integerId/unblock', adminController.unblockClient);
router.get('/clients/:integerId/transactions', adminController.getClientTransactions);
router.post('/clients/:id/deposit', adminController.depositToClient);
router.post('/clients/:id/withdraw', adminController.withdrawFromClient);


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
router.get('/clients/:integerId/orders', adminController.getClientOrders);
router.post('/orders', adminController.placeOrder);
router.post('/orders/:id/refresh', adminController.refreshOrderStatus);

// Wait order management (for مزود category)
router.get('/orders/wait', adminController.listWaitOrders);
router.post('/orders/:orderId/accept', adminController.acceptWaitOrder);
router.post('/orders/:orderId/reject', adminController.rejectWaitOrder);

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

// Notification management (admin only)
router.post('/notifications/send-all', notificationController.sendNotificationToAll);
router.post('/notifications/send-roles', notificationController.sendNotificationToRoles);
router.post('/notifications/send-users', notificationController.sendNotificationToUsers);
router.get('/notifications', notificationController.listNotifications);
router.get('/notifications/:id', notificationController.getNotification);
router.delete('/notifications/:id', notificationController.deleteNotification);

export default router;
