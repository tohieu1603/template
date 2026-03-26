import { Router } from 'express';
import { listNotifications, createNotification, markRead, markAllRead, deleteNotification } from './notification.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateNotificationDto } from './dto/notification.dto';

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notifications
 */
const router = Router();

router.get('/', auth(), listNotifications);
router.get('/my', auth(), listNotifications);
router.post('/', auth(), rbac('notifications.create'), validateDto(CreateNotificationDto), createNotification);
router.put('/:id/read', auth(), markRead);
router.put('/read-all', auth(), markAllRead);
router.delete('/:id', auth(), deleteNotification);

export default router;
