import { Router } from 'express';
import { listCoupons, getCoupon, createCoupon, updateCoupon, deleteCoupon, applyCoupon } from './coupon.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateCouponDto, UpdateCouponDto, ApplyCouponDto } from './dto/coupon.dto';

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Discount coupon management
 */
const router = Router();

router.get('/', auth(), rbac('coupons.view'), listCoupons);
router.get('/:id', auth(), rbac('coupons.view'), getCoupon);
router.post('/', auth(), rbac('coupons.create'), validateDto(CreateCouponDto), createCoupon);
router.put('/:id', auth(), rbac('coupons.update'), validateDto(UpdateCouponDto), updateCoupon);
router.delete('/:id', auth(), rbac('coupons.delete'), deleteCoupon);
router.post('/apply', auth(), validateDto(ApplyCouponDto), applyCoupon);

export default router;
