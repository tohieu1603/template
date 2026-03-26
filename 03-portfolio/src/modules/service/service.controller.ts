import { Request, Response, NextFunction } from 'express';
import { ServiceService } from './service.service';
import { successResponse } from '../../common/dto/api-response.dto';

const serviceService = new ServiceService();

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Offered services management
 */

export async function listServices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await serviceService.findAll(req.query as any);
    res.json(successResponse(result.services, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const service = await serviceService.findById(req.params.id);
    res.json(successResponse(service));
  } catch (error) { next(error); }
}

export async function createService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const service = await serviceService.create(req.body);
    res.status(201).json(successResponse(service, 'Service created'));
  } catch (error) { next(error); }
}

export async function updateService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const service = await serviceService.update(req.params.id, req.body);
    res.json(successResponse(service, 'Service updated'));
  } catch (error) { next(error); }
}

export async function deleteService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await serviceService.delete(req.params.id);
    res.json(successResponse(null, 'Service deleted'));
  } catch (error) { next(error); }
}
