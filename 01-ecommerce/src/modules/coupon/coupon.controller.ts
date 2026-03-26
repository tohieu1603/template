import { Request, Response, NextFunction } from 'express';
import { CouponService } from './coupon.service';
import { successResponse } from '../../common/dto/api-response.dto';

const couponService = new CouponService();

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Coupon management
 */

export async function listCoupons(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { coupons, meta } = await couponService.findAll(req.query as any);
    res.json(successResponse(coupons, undefined, meta));
  } catch (error) { next(error); }
}

export async function getCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const coupon = await couponService.findById(req.params.id);
    res.json(successResponse(coupon));
  } catch (error) { next(error); }
}

export async function createCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const coupon = await couponService.create(req.body);
    res.status(201).json(successResponse(coupon, 'Coupon created'));
  } catch (error) { next(error); }
}

export async function updateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const coupon = await couponService.update(req.params.id, req.body);
    res.json(successResponse(coupon, 'Coupon updated'));
  } catch (error) { next(error); }
}

export async function deleteCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await couponService.delete(req.params.id);
    res.json(successResponse(null, 'Coupon deleted'));
  } catch (error) { next(error); }
}

export async function applyCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await couponService.applyCoupon(req.body);
    res.json(successResponse(result, 'Coupon applied'));
  } catch (error) { next(error); }
}
