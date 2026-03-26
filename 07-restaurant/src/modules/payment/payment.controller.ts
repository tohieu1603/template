import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payment.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new PaymentService();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management
 */

export const listPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.payments, undefined, result.meta));
  } catch (e) { next(e); }
};

export const getPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const p = await service.findById(req.params.id);
    res.json(successResponse(p));
  } catch (e) { next(e); }
};

export const processPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const p = await service.process(req.body);
    res.status(201).json(successResponse(p, 'Payment processed'));
  } catch (e) { next(e); }
};

export const markPaid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const p = await service.markPaid(req.params.id);
    res.json(successResponse(p, 'Payment marked as paid'));
  } catch (e) { next(e); }
};

export const refundPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const p = await service.refund(req.params.id, req.body);
    res.json(successResponse(p, 'Payment refunded'));
  } catch (e) { next(e); }
};
