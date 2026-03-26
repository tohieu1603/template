import { Request, Response, NextFunction } from 'express';
import { WishlistService } from './wishlist.service';
import { successResponse } from '../../common/dto/api-response.dto';

const wishlistService = new WishlistService();

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: User wishlist management
 */

export async function getWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { items, meta } = await wishlistService.findByUser(req.user!.id, req.query as any);
    res.json(successResponse(items, undefined, meta));
  } catch (error) { next(error); }
}

export async function toggleWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await wishlistService.toggle(req.user!.id, req.params.productId);
    res.json(successResponse(result, result.added ? 'Added to wishlist' : 'Removed from wishlist'));
  } catch (error) { next(error); }
}

export async function checkWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const isWishlisted = await wishlistService.check(req.user!.id, req.params.productId);
    res.json(successResponse({ isWishlisted }));
  } catch (error) { next(error); }
}
