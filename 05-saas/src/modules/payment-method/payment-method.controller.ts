import { Request, Response, NextFunction } from 'express';
import { PaymentMethodService } from './payment-method.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new PaymentMethodService();

export const listPaymentMethods = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const methods = await service.findAll(req.params.orgId);
    res.json(successResponse(methods));
  } catch (e) { next(e); }
};

export const addPaymentMethod = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pm = await service.add(req.params.orgId, req.body);
    res.status(201).json(successResponse(pm, 'Payment method added'));
  } catch (e) { next(e); }
};

export const setDefaultPaymentMethod = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pm = await service.setDefault(req.params.id, req.params.orgId);
    res.json(successResponse(pm, 'Default payment method set'));
  } catch (e) { next(e); }
};

export const removePaymentMethod = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.remove(req.params.id, req.params.orgId);
    res.json(successResponse(null, 'Payment method removed'));
  } catch (e) { next(e); }
};
