import { Request, Response, NextFunction } from 'express';
import { OrderService } from './order.service';
import { successResponse } from '../../common/dto/api-response.dto';

const orderService = new OrderService();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

export async function listOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const isAdmin = req.user!.roles.some((r) => ['super_admin', 'admin', 'staff'].includes(r));
    const { orders, meta } = await orderService.findAll(req.query as any, req.user!.id, isAdmin);
    res.json(successResponse(orders, undefined, meta));
  } catch (error) { next(error); }
}

export async function getOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const isAdmin = req.user!.roles.some((r) => ['super_admin', 'admin', 'staff'].includes(r));
    const order = await orderService.findById(req.params.id, req.user!.id, isAdmin);
    res.json(successResponse(order));
  } catch (error) { next(error); }
}

/**
 * @swagger
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create a new order
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items, shippingName, shippingPhone, shippingAddress, paymentMethod]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     variantId: { type: string }
 *                     quantity: { type: integer }
 *               shippingName: { type: string }
 *               shippingPhone: { type: string }
 *               shippingAddress: { type: string }
 *               paymentMethod: { type: string }
 *               couponCode: { type: string }
 *               note: { type: string }
 *     responses:
 *       201:
 *         description: Order created successfully
 */
export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await orderService.create(req.user!.id, req.body);
    res.status(201).json(successResponse(order, 'Order created successfully'));
  } catch (error) { next(error); }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await orderService.updateStatus(req.params.id, req.body, req.user!.id);
    res.json(successResponse(order, 'Order status updated'));
  } catch (error) { next(error); }
}

export async function cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await orderService.cancelOrder(req.params.id, req.user!.id, req.body.reason);
    res.json(successResponse(order, 'Order cancelled'));
  } catch (error) { next(error); }
}
