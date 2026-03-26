import { Router } from 'express';
import { listPayments, getPayment, getMyPayments, createPayment, updatePaymentStatus } from './payment.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreatePaymentDto, UpdatePaymentStatusDto } from './dto/payment.dto';

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing
 */
const router = Router();

router.get('/', auth(), rbac('payments.view'), listPayments);
router.get('/my', auth(), getMyPayments);
router.get('/:id', auth(), getPayment);
router.post('/', auth(), validateDto(CreatePaymentDto), createPayment);
router.put('/:id/status', auth(), rbac('payments.update'), validateDto(UpdatePaymentStatusDto), updatePaymentStatus);

export default router;
