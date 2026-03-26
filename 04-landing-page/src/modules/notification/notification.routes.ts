import { Router } from 'express';
import { listNotifications, markRead, markAllRead, deleteNotification } from './notification.controller';
import { auth } from '../../common/middleware/auth.middleware';

const router = Router();

router.get('/', auth(), listNotifications);
router.put('/mark-all-read', auth(), markAllRead);
router.put('/:id/read', auth(), markRead);
router.delete('/:id', auth(), deleteNotification);

export default router;
