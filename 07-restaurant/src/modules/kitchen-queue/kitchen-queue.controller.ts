import { Request, Response, NextFunction } from 'express';
import { KitchenQueueService } from './kitchen-queue.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new KitchenQueueService();

/**
 * @swagger
 * tags:
 *   name: KitchenQueue
 *   description: Kitchen queue management
 */

export const listQueue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (e) { next(e); }
};

export const getQueueItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await service.findById(req.params.id);
    res.json(successResponse(item));
  } catch (e) { next(e); }
};

export const updateQueueItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await service.update(req.params.id, req.body);
    res.json(successResponse(item, 'Queue item updated'));
  } catch (e) { next(e); }
};

export const startQueueItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await service.start(req.params.id);
    res.json(successResponse(item, 'Preparation started'));
  } catch (e) { next(e); }
};

export const completeQueueItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await service.complete(req.params.id);
    res.json(successResponse(item, 'Item completed'));
  } catch (e) { next(e); }
};
