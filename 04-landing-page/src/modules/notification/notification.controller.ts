import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';
import { successResponse } from '../../common/dto/api-response.dto';

const notificationService = new NotificationService();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notifications
 */

export async function listNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await notificationService.findAll(req.user!.id, req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const notification = await notificationService.markRead(req.params.id, req.user!.id);
    res.json(successResponse(notification, 'Notification marked as read'));
  } catch (error) { next(error); }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await notificationService.markAllRead(req.user!.id);
    res.json(successResponse(null, 'All notifications marked as read'));
  } catch (error) { next(error); }
}

export async function deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await notificationService.delete(req.params.id, req.user!.id);
    res.json(successResponse(null, 'Notification deleted'));
  } catch (error) { next(error); }
}
