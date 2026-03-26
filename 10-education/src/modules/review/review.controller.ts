import { Request, Response, NextFunction } from 'express';
import { ReviewService } from './review.service';
import { successResponse } from '../../common/dto/api-response.dto';

const reviewService = new ReviewService();

export const listReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await reviewService.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
};

export const getReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await reviewService.findById(req.params.id);
    res.json(successResponse(review));
  } catch (error) { next(error); }
};

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await reviewService.create(req.user!.id, req.body);
    res.status(201).json(successResponse(review, 'Review submitted'));
  } catch (error) { next(error); }
};

export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await reviewService.update(req.params.id, req.user!.id, req.body);
    res.json(successResponse(review, 'Review updated'));
  } catch (error) { next(error); }
};

export const adminReply = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await reviewService.adminReply(req.params.id, req.body);
    res.json(successResponse(review, 'Reply added'));
  } catch (error) { next(error); }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await reviewService.delete(req.params.id);
    res.json(successResponse(null, 'Review deleted'));
  } catch (error) { next(error); }
};
