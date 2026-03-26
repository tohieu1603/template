import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new NotificationService();

export const listNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.user!.id, req.query as any);
    res.json(successResponse(result.notifications, undefined, result.meta));
  } catch (e) { next(e); }
};

export const createNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const n = await service.create(req.body);
    res.status(201).json(successResponse(n, 'Notification created'));
  } catch (e) { next(e); }
};

export const markRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const n = await service.markRead(req.params.id, req.user!.id);
    res.json(successResponse(n, 'Marked as read'));
  } catch (e) { next(e); }
};

export const markAllRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.markAllRead(req.user!.id);
    res.json(successResponse(null, 'All notifications marked as read'));
  } catch (e) { next(e); }
};

export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id, req.user!.id);
    res.json(successResponse(null, 'Notification deleted'));
  } catch (e) { next(e); }
};
