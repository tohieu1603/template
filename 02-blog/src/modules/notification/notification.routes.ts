import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { listNotifications, markAsRead, markAllAsRead, deleteNotification } from './notification.controller';

const router = Router();

router.use(auth());
router.get('/', listNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

export default router;
