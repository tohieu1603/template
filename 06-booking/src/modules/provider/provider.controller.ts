import { Request, Response, NextFunction } from 'express';
import { ProviderService } from './provider.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new ProviderService();

/**
 * @swagger
 * tags:
 *   name: Providers
 *   description: Provider/staff management
 */

export async function listProviders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getProvider(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.findById(req.params.id);
    res.json(successResponse(item));
  } catch (error) { next(error); }
}

export async function createProvider(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.create(req.body);
    res.status(201).json(successResponse(item, 'Provider created'));
  } catch (error) { next(error); }
}

export async function updateProvider(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.update(req.params.id, req.body);
    res.json(successResponse(item, 'Provider updated'));
  } catch (error) { next(error); }
}

export async function deleteProvider(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await service.delete(req.params.id);
    res.json(successResponse(null, 'Provider deleted'));
  } catch (error) { next(error); }
}

export async function getWorkingHours(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await service.getWorkingHours(req.params.id);
    res.json(successResponse(items));
  } catch (error) { next(error); }
}

export async function setWorkingHours(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.setWorkingHours(req.params.id, req.body);
    res.json(successResponse(item, 'Working hours updated'));
  } catch (error) { next(error); }
}

export async function deleteWorkingHours(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await service.deleteWorkingHours(req.params.whId);
    res.json(successResponse(null, 'Working hours deleted'));
  } catch (error) { next(error); }
}

export async function getBreaks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await service.getBreaks(req.params.id);
    res.json(successResponse(items));
  } catch (error) { next(error); }
}

export async function addBreak(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.addBreak(req.params.id, req.body);
    res.status(201).json(successResponse(item, 'Break added'));
  } catch (error) { next(error); }
}

export async function deleteBreak(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await service.deleteBreak(req.params.breakId);
    res.json(successResponse(null, 'Break deleted'));
  } catch (error) { next(error); }
}

export async function getBlockedSlots(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await service.getBlockedSlots(req.params.id);
    res.json(successResponse(items));
  } catch (error) { next(error); }
}

export async function addBlockedSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.addBlockedSlot(req.params.id, req.body, req.user!.id);
    res.status(201).json(successResponse(item, 'Blocked slot added'));
  } catch (error) { next(error); }
}

export async function deleteBlockedSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await service.deleteBlockedSlot(req.params.slotId);
    res.json(successResponse(null, 'Blocked slot deleted'));
  } catch (error) { next(error); }
}
