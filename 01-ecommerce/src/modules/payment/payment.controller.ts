import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payment.service';
import { successResponse } from '../../common/dto/api-response.dto';

const paymentService = new PaymentService();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing and management
 */

export async function listPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { payments, meta } = await paymentService.findAll(req.query as any);
    res.json(successResponse(payments, undefined, meta));
  } catch (error) { next(error); }
}

export async function getOrderPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payments = await paymentService.findByOrder(req.params.orderId);
    res.json(successResponse(payments));
  } catch (error) { next(error); }
}

export async function processPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payment = await paymentService.processPayment(req.body);
    res.status(201).json(successResponse(payment, 'Payment processed'));
  } catch (error) { next(error); }
}

export async function refundPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payment = await paymentService.refund(req.params.id, req.body);
    res.json(successResponse(payment, 'Payment refunded'));
  } catch (error) { next(error); }
}
