import { Request, Response, NextFunction } from 'express';
import { ReviewService } from './review.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new ReviewService();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Customer review management
 */

export const listReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.reviews, undefined, result.meta));
  } catch (e) { next(e); }
};

export const getReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const r = await service.findById(req.params.id);
    res.json(successResponse(r));
  } catch (e) { next(e); }
};

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const r = await service.create(req.body, req.user!.id);
    res.status(201).json(successResponse(r, 'Review submitted'));
  } catch (e) { next(e); }
};

export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user?.roles.includes('admin') || req.user?.roles.includes('super_admin');
    const r = await service.update(req.params.id, req.body, req.user!.id, !!isAdmin);
    res.json(successResponse(r, 'Review updated'));
  } catch (e) { next(e); }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user?.roles.includes('admin') || req.user?.roles.includes('super_admin');
    await service.delete(req.params.id, req.user!.id, !!isAdmin);
    res.json(successResponse(null, 'Review deleted'));
  } catch (e) { next(e); }
};

export const adminReply = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const r = await service.adminReply(req.params.id, req.body);
    res.json(successResponse(r, 'Reply added'));
  } catch (e) { next(e); }
};

export const toggleVisibility = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const r = await service.toggleVisibility(req.params.id);
    res.json(successResponse(r, 'Visibility updated'));
  } catch (e) { next(e); }
};
