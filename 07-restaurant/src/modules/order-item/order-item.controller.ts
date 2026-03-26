import { Request, Response, NextFunction } from 'express';
import { OrderItemService } from './order-item.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new OrderItemService();

/**
 * @swagger
 * tags:
 *   name: OrderItems
 *   description: Order item management
 */

export const getOrderItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await service.findById(req.params.id);
    res.json(successResponse(item));
  } catch (e) { next(e); }
};

export const updateOrderItemStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await service.updateStatus(req.params.id, req.body);
    res.json(successResponse(item, 'Order item status updated'));
  } catch (e) { next(e); }
};
