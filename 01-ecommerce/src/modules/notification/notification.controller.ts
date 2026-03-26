import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';
import { successResponse } from '../../common/dto/api-response.dto';

const notificationService = new NotificationService();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notification management
 */

export async function listNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { notifications, unreadCount, meta } = await notificationService.findByUser(req.user!.id, req.query as any);
    res.json(successResponse({ notifications, unreadCount }, undefined, meta));
  } catch (error) { next(error); }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user!.id);
    res.json(successResponse(notification, 'Marked as read'));
  } catch (error) { next(error); }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await notificationService.markAllAsRead(req.user!.id);
    res.json(successResponse(null, 'All notifications marked as read'));
  } catch (error) { next(error); }
}

export async function deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await notificationService.delete(req.params.id, req.user!.id);
    res.json(successResponse(null, 'Notification deleted'));
  } catch (error) { next(error); }
}
