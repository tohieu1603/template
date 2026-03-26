import { Router } from 'express';
import { listQueue, getQueueItem, updateQueueItem, startQueueItem, completeQueueItem } from './kitchen-queue.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { UpdateKitchenQueueDto, KitchenQueueQueryDto } from './dto/kitchen-queue.dto';

const router = Router();

router.get('/', auth(), rbac('kitchen_queue.view'), validateDto(KitchenQueueQueryDto, 'query'), listQueue);
router.get('/:id', auth(), rbac('kitchen_queue.view'), getQueueItem);
router.put('/:id', auth(), rbac('kitchen_queue.update'), validateDto(UpdateKitchenQueueDto), updateQueueItem);
router.patch('/:id/start', auth(), rbac('kitchen_queue.update'), startQueueItem);
router.patch('/:id/complete', auth(), rbac('kitchen_queue.update'), completeQueueItem);

export default router;
