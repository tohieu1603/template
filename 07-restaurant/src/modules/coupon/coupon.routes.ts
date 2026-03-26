import { Router } from 'express';
import { listCoupons, getCoupon, createCoupon, updateCoupon, deleteCoupon, applyCoupon } from './coupon.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { CreateCouponDto, UpdateCouponDto, ApplyCouponDto, CouponQueryDto } from './dto/coupon.dto';

const router = Router();

router.post('/apply', validateDto(ApplyCouponDto), applyCoupon);
router.get('/', auth(), rbac('coupons.view'), validateDto(CouponQueryDto, 'query'), listCoupons);
router.get('/:id', auth(), rbac('coupons.view'), getCoupon);
router.post('/', auth(), rbac('coupons.create'), validateDto(CreateCouponDto), createCoupon);
router.put('/:id', auth(), rbac('coupons.update'), validateDto(UpdateCouponDto), updateCoupon);
router.delete('/:id', auth(), rbac('coupons.delete'), deleteCoupon);

export default router;
