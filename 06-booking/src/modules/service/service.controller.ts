import { Request, Response, NextFunction } from 'express';
import { ServiceService } from './service.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new ServiceService();

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Booking services management
 */

export async function listServices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.findById(req.params.id);
    res.json(successResponse(item));
  } catch (error) { next(error); }
}

export async function createService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.create(req.body);
    res.status(201).json(successResponse(item, 'Service created'));
  } catch (error) { next(error); }
}

export async function updateService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.update(req.params.id, req.body);
    res.json(successResponse(item, 'Service updated'));
  } catch (error) { next(error); }
}

export async function deleteService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await service.delete(req.params.id);
    res.json(successResponse(null, 'Service deleted'));
  } catch (error) { next(error); }
}
