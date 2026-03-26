import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payment.service';
import { successResponse } from '../../common/dto/api-response.dto';

const paymentService = new PaymentService();

export const listPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await paymentService.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
};

export const getPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payment = await paymentService.findById(req.params.id);
    res.json(successResponse(payment));
  } catch (error) { next(error); }
};

export const getMyPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await paymentService.findMyPayments(req.user!.id, req.query);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
};

export const createPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payment = await paymentService.create(req.user!.id, req.body);
    res.status(201).json(successResponse(payment, 'Payment created'));
  } catch (error) { next(error); }
};

export const updatePaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payment = await paymentService.updateStatus(req.params.id, req.body);
    res.json(successResponse(payment, 'Payment status updated'));
  } catch (error) { next(error); }
};
