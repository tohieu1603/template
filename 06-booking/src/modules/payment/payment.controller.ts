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

export async function listPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.findById(req.params.id);
    res.json(successResponse(item));
  } catch (error) { next(error); }
}

export async function createPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.create(req.body);
    res.status(201).json(successResponse(item, 'Payment created'));
  } catch (error) { next(error); }
}

export async function markAsPaid(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.markAsPaid(req.params.id);
    res.json(successResponse(item, 'Payment marked as paid'));
  } catch (error) { next(error); }
}

export async function refundPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.refund(req.params.id, req.body);
    res.json(successResponse(item, 'Payment refunded'));
  } catch (error) { next(error); }
}
