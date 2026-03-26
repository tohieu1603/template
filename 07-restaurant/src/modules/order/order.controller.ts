import { Request, Response, NextFunction } from 'express';
import { OrderService } from './order.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new OrderService();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

export const listOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.orders, undefined, result.meta));
  } catch (e) { next(e); }
};

export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await service.findById(req.params.id);
    res.json(successResponse(order));
  } catch (e) { next(e); }
};

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await service.create(req.body, req.user?.id);
    res.status(201).json(successResponse(order, 'Order created'));
  } catch (e) { next(e); }
};

export const confirmOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await service.confirm(req.params.id, req.user?.id);
    res.json(successResponse(order, 'Order confirmed'));
  } catch (e) { next(e); }
};

export const prepareOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await service.prepare(req.params.id, req.user?.id);
    res.json(successResponse(order, 'Order being prepared'));
  } catch (e) { next(e); }
};

export const readyOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await service.ready(req.params.id, req.user?.id);
    res.json(successResponse(order, 'Order ready'));
  } catch (e) { next(e); }
};

export const serveOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await service.serve(req.params.id, req.user?.id);
    res.json(successResponse(order, 'Order served'));
  } catch (e) { next(e); }
};

export const completeOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await service.complete(req.params.id, req.user?.id);
    res.json(successResponse(order, 'Order completed'));
  } catch (e) { next(e); }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await service.cancel(req.params.id, req.body, req.user?.id);
    res.json(successResponse(order, 'Order cancelled'));
  } catch (e) { next(e); }
};

export const getOrderHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const history = await service.getHistory(req.params.id);
    res.json(successResponse(history));
  } catch (e) { next(e); }
};
