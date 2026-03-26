import { Request, Response, NextFunction } from 'express';
import { BlockedSlotService } from './blocked-slot.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new BlockedSlotService();

export async function listBlockedSlots(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getBlockedSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slot = await service.findById(req.params.id);
    res.json(successResponse(slot));
  } catch (error) { next(error); }
}

export async function createBlockedSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slot = await service.create(req.body, req.user!.id);
    res.status(201).json(successResponse(slot, 'Blocked slot created'));
  } catch (error) { next(error); }
}

export async function deleteBlockedSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await service.delete(req.params.id);
    res.json(successResponse(null, 'Blocked slot deleted'));
  } catch (error) { next(error); }
}
