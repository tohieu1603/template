import { Request, Response, NextFunction } from 'express';
import { CouponService } from './coupon.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new CouponService();

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Coupon management
 */

export const listCoupons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.coupons, undefined, result.meta));
  } catch (e) { next(e); }
};

export const getCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const c = await service.findById(req.params.id);
    res.json(successResponse(c));
  } catch (e) { next(e); }
};

export const createCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const c = await service.create(req.body);
    res.status(201).json(successResponse(c, 'Coupon created'));
  } catch (e) { next(e); }
};

export const updateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const c = await service.update(req.params.id, req.body);
    res.json(successResponse(c, 'Coupon updated'));
  } catch (e) { next(e); }
};

export const deleteCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id);
    res.json(successResponse(null, 'Coupon deleted'));
  } catch (e) { next(e); }
};

export const applyCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.apply(req.body);
    res.json(successResponse(result, 'Coupon applied'));
  } catch (e) { next(e); }
};
