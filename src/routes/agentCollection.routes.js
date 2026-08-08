import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import * as agentCollectionController from '../controllers/agentCollection.controller.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', agentCollectionController.listAgents);
router.post('/', agentCollectionController.createAgent);
router.get('/:id', agentCollectionController.getAgent);
router.patch('/:id', agentCollectionController.updateAgent);
router.delete('/:id', agentCollectionController.deleteAgent);

export default router;
