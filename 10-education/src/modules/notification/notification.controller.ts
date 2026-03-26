import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';
import { successResponse } from '../../common/dto/api-response.dto';

const notificationService = new NotificationService();

export const listNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await notificationService.findAll(req.user!.id, req.query);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
};

export const createNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await notificationService.create(req.body);
    res.status(201).json(successResponse(notification, 'Notification created'));
  } catch (error) { next(error); }
};

export const markRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await notificationService.markRead(req.params.id, req.user!.id);
    res.json(successResponse(notification, 'Marked as read'));
  } catch (error) { next(error); }
};

export const markAllRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationService.markAllRead(req.user!.id);
    res.json(successResponse(null, 'All marked as read'));
  } catch (error) { next(error); }
};

export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationService.delete(req.params.id, req.user!.id);
    res.json(successResponse(null, 'Notification deleted'));
  } catch (error) { next(error); }
};
