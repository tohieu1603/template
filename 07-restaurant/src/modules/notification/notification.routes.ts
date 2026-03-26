import { Router } from 'express';
import { listMyNotifications, listAllNotifications, createNotification, markRead, markAllRead, deleteNotification } from './notification.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { CreateNotificationDto, NotificationQueryDto } from './dto/notification.dto';

const router = Router();

router.get('/my', auth(), validateDto(NotificationQueryDto, 'query'), listMyNotifications);
router.get('/', auth(), rbac('notifications.view'), validateDto(NotificationQueryDto, 'query'), listAllNotifications);
router.post('/', auth(), rbac('notifications.create'), validateDto(CreateNotificationDto), createNotification);
router.patch('/:id/read', auth(), markRead);
router.patch('/read-all', auth(), markAllRead);
router.delete('/:id', auth(), deleteNotification);

export default router;
