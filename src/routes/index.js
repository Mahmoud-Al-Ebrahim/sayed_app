import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import clientRoutes from './client.routes.js';
import { msg } from '../constants/messages.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: msg.OK });
});

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/client', clientRoutes);

export default router;
