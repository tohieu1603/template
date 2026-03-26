import { Request, Response, NextFunction } from 'express';
import { CartService } from './cart.service';
import { successResponse } from '../../common/dto/api-response.dto';

const cartService = new CartService();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management
 */

export async function getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cart = await cartService.getCart(req.user!.id);
    res.json(successResponse(cart));
  } catch (error) { next(error); }
}

export async function addToCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await cartService.addItem(req.user!.id, req.body);
    res.status(201).json(successResponse(item, 'Item added to cart'));
  } catch (error) { next(error); }
}

export async function updateCartItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await cartService.updateItem(req.user!.id, req.params.id, req.body);
    res.json(successResponse(item, 'Cart item updated'));
  } catch (error) { next(error); }
}

export async function removeCartItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await cartService.removeItem(req.user!.id, req.params.id);
    res.json(successResponse(null, 'Item removed from cart'));
  } catch (error) { next(error); }
}

export async function clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await cartService.clearCart(req.user!.id);
    res.json(successResponse(null, 'Cart cleared'));
  } catch (error) { next(error); }
}
