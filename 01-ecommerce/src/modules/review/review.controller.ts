import { Request, Response, NextFunction } from 'express';
import { ReviewService } from './review.service';
import { successResponse } from '../../common/dto/api-response.dto';

const reviewService = new ReviewService();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Product reviews management
 */

export async function listReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { reviews, meta } = await reviewService.findAll(req.query as any);
    res.json(successResponse(reviews, undefined, meta));
  } catch (error) { next(error); }
}

export async function getProductStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await reviewService.getProductStats(req.params.productId);
    res.json(successResponse(stats));
  } catch (error) { next(error); }
}

export async function getReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const review = await reviewService.findById(req.params.id);
    res.json(successResponse(review));
  } catch (error) { next(error); }
}

export async function createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const review = await reviewService.create(req.user!.id, req.body);
    res.status(201).json(successResponse(review, 'Review submitted'));
  } catch (error) { next(error); }
}

export async function updateReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const review = await reviewService.update(req.params.id, req.user!.id, req.body);
    res.json(successResponse(review, 'Review updated'));
  } catch (error) { next(error); }
}

export async function adminUpdateReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const review = await reviewService.adminUpdate(req.params.id, req.body);
    res.json(successResponse(review, 'Review updated'));
  } catch (error) { next(error); }
}

export async function deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const isAdmin = req.user!.roles.some((r) => ['super_admin', 'admin'].includes(r));
    await reviewService.delete(req.params.id, req.user!.id, isAdmin);
    res.json(successResponse(null, 'Review deleted'));
  } catch (error) { next(error); }
}
