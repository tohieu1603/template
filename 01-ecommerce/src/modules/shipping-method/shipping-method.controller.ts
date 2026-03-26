import { Request, Response, NextFunction } from 'express';
import { ShippingMethodService } from './shipping-method.service';
import { successResponse } from '../../common/dto/api-response.dto';

const shippingMethodService = new ShippingMethodService();

/**
 * @swagger
 * tags:
 *   name: ShippingMethods
 *   description: Shipping method management
 */

export async function listShippingMethods(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { methods, meta } = await shippingMethodService.findAll(req.query as any);
    res.json(successResponse(methods, undefined, meta));
  } catch (error) { next(error); }
}

export async function getShippingMethod(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const method = await shippingMethodService.findById(req.params.id);
    res.json(successResponse(method));
  } catch (error) { next(error); }
}

export async function createShippingMethod(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const method = await shippingMethodService.create(req.body);
    res.status(201).json(successResponse(method, 'Shipping method created'));
  } catch (error) { next(error); }
}

export async function updateShippingMethod(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const method = await shippingMethodService.update(req.params.id, req.body);
    res.json(successResponse(method, 'Shipping method updated'));
  } catch (error) { next(error); }
}

export async function deleteShippingMethod(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await shippingMethodService.delete(req.params.id);
    res.json(successResponse(null, 'Shipping method deleted'));
  } catch (error) { next(error); }
}
