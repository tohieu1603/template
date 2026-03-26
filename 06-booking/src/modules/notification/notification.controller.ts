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
    const userId = req.user?.id;
    const result = await notificationService.findAll(req.query as any, userId);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) {
    next(error);
  }
}

export async function createNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const notification = await notificationService.create(req.body);
    res.status(201).json(successResponse(notification, 'Notification sent'));
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user!.id);
    res.json(successResponse(notification, 'Notification marked as read'));
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await notificationService.markAllAsRead(req.user!.id);
    res.json(successResponse(null, 'All notifications marked as read'));
  } catch (error) {
    next(error);
  }
}

export async function deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await notificationService.delete(req.params.id);
    res.json(successResponse(null, 'Notification deleted'));
  } catch (error) {
    next(error);
  }
}
