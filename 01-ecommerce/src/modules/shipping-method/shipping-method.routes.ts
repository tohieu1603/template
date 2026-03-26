import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listShippingMethods, getShippingMethod, createShippingMethod, updateShippingMethod, deleteShippingMethod } from './shipping-method.controller';
import { CreateShippingMethodDto, UpdateShippingMethodDto, ShippingMethodQueryDto } from './dto/shipping-method.dto';

const router = Router();

router.get('/', validateDto(ShippingMethodQueryDto, 'query'), listShippingMethods);
router.get('/:id', getShippingMethod);
router.post('/', auth(), rbac('shipping_methods.create'), validateDto(CreateShippingMethodDto), createShippingMethod);
router.put('/:id', auth(), rbac('shipping_methods.update'), validateDto(UpdateShippingMethodDto), updateShippingMethod);
router.delete('/:id', auth(), rbac('shipping_methods.delete'), deleteShippingMethod);

export default router;
