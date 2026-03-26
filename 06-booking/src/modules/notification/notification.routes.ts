import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateNotificationDto, NotificationQueryDto } from './dto/notification.dto';
import { listNotifications, createNotification, markAsRead, markAllAsRead, deleteNotification } from './notification.controller';

const router = Router();

router.get('/', auth(), validateDto(NotificationQueryDto, 'query'), listNotifications);
router.post('/', auth(), rbac('notifications.create'), validateDto(CreateNotificationDto), createNotification);
router.patch('/:id/read', auth(), markAsRead);
router.patch('/read-all', auth(), markAllAsRead);
router.delete('/:id', auth(), rbac('notifications.delete'), deleteNotification);

export default router;
