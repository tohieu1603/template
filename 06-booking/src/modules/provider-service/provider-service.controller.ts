import { Request, Response, NextFunction } from 'express';
import { ProviderServiceService } from './provider-service.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new ProviderServiceService();

/**
 * @swagger
 * tags:
 *   name: ProviderServices
 *   description: Assign services to providers
 */

export async function getProviderServices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await service.getServicesForProvider(req.params.providerId);
    res.json(successResponse(items));
  } catch (error) { next(error); }
}

export async function getServiceProviders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await service.getProvidersForService(req.params.serviceId);
    res.json(successResponse(items));
  } catch (error) { next(error); }
}

export async function assignService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await service.assign(req.params.providerId, req.body.serviceId);
    res.json(successResponse(null, 'Service assigned to provider'));
  } catch (error) { next(error); }
}

export async function removeService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await service.remove(req.params.providerId, req.params.serviceId);
    res.json(successResponse(null, 'Service removed from provider'));
  } catch (error) { next(error); }
}
