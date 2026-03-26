import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listCoupons, getCoupon, createCoupon, updateCoupon, deleteCoupon, applyCoupon } from './coupon.controller';
import { CreateCouponDto, UpdateCouponDto, ApplyCouponDto, CouponQueryDto } from './dto/coupon.dto';

const router = Router();

// Public apply coupon (for checkout preview)
router.post('/apply', auth(), validateDto(ApplyCouponDto), applyCoupon);

// Admin management
router.get('/', auth(), rbac('coupons.view'), validateDto(CouponQueryDto, 'query'), listCoupons);
router.post('/', auth(), rbac('coupons.create'), validateDto(CreateCouponDto), createCoupon);
router.get('/:id', auth(), rbac('coupons.view'), getCoupon);
router.put('/:id', auth(), rbac('coupons.update'), validateDto(UpdateCouponDto), updateCoupon);
router.delete('/:id', auth(), rbac('coupons.delete'), deleteCoupon);

export default router;
