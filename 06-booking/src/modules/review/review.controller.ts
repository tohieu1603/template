import { Request, Response, NextFunction } from 'express';
import { ReviewService } from './review.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new ReviewService();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Review management
 */

export async function listReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.findById(req.params.id);
    res.json(successResponse(item));
  } catch (error) { next(error); }
}

export async function createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.create(req.body, req.user!.id);
    res.status(201).json(successResponse(item, 'Review submitted'));
  } catch (error) { next(error); }
}

export async function updateReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.update(req.params.id, req.body, req.user!.id);
    res.json(successResponse(item, 'Review updated'));
  } catch (error) { next(error); }
}

export async function replyToReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.reply(req.params.id, req.body);
    res.json(successResponse(item, 'Reply added'));
  } catch (error) { next(error); }
}

export async function deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await service.delete(req.params.id);
    res.json(successResponse(null, 'Review deleted'));
  } catch (error) { next(error); }
}
