import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { listBlockedSlots, getBlockedSlot, createBlockedSlot, deleteBlockedSlot } from './blocked-slot.controller';

const router = Router();

router.get('/', auth(), rbac('providers.view'), listBlockedSlots);
router.get('/:id', auth(), rbac('providers.view'), getBlockedSlot);
router.post('/', auth(), rbac('providers.update'), createBlockedSlot);
router.delete('/:id', auth(), rbac('providers.update'), deleteBlockedSlot);

export default router;
