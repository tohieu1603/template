import { Request, Response, NextFunction } from 'express';
import { CouponService } from './coupon.service';
import { successResponse } from '../../common/dto/api-response.dto';

const couponService = new CouponService();

export const listCoupons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await couponService.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
};

export const getCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupon = await couponService.findById(req.params.id);
    res.json(successResponse(coupon));
  } catch (error) { next(error); }
};

export const createCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupon = await couponService.create(req.body);
    res.status(201).json(successResponse(coupon, 'Coupon created'));
  } catch (error) { next(error); }
};

export const updateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupon = await couponService.update(req.params.id, req.body);
    res.json(successResponse(coupon, 'Coupon updated'));
  } catch (error) { next(error); }
};

export const deleteCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await couponService.delete(req.params.id);
    res.json(successResponse(null, 'Coupon deleted'));
  } catch (error) { next(error); }
};

export const applyCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await couponService.apply(req.body);
    res.json(successResponse(result, 'Coupon applied'));
  } catch (error) { next(error); }
};
