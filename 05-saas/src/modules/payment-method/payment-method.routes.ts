import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listPaymentMethods, addPaymentMethod, setDefaultPaymentMethod, removePaymentMethod } from './payment-method.controller';
import { CreatePaymentMethodDto } from './dto/payment-method.dto';

/**
 * @swagger
 * tags:
 *   name: PaymentMethods
 *   description: Payment method management
 */

const router = Router({ mergeParams: true });

router.get('/', auth(), listPaymentMethods);
router.post('/', auth(), validateDto(CreatePaymentMethodDto), addPaymentMethod);
router.patch('/:id/default', auth(), setDefaultPaymentMethod);
router.delete('/:id', auth(), removePaymentMethod);

export default router;
