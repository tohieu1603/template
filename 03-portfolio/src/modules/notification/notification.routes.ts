import { Router } from 'express';
import { listNotifications, createNotification, markRead, markAllRead, deleteNotification } from './notification.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { CreateNotificationDto, NotificationQueryDto } from './dto/notification.dto';

const router = Router();

router.get('/', auth(), validateDto(NotificationQueryDto, 'query'), listNotifications);
router.post('/', auth(), rbac('notifications.create'), validateDto(CreateNotificationDto), createNotification);
router.patch('/read-all', auth(), markAllRead);
router.patch('/:id/read', auth(), markRead);
router.delete('/:id', auth(), deleteNotification);

export default router;
