import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreatePaymentDto, RefundPaymentDto, PaymentQueryDto } from './dto/payment.dto';
import { listPayments, getPayment, createPayment, markAsPaid, refundPayment } from './payment.controller';

const router = Router();

router.get('/', auth(), rbac('payments.view'), validateDto(PaymentQueryDto, 'query'), listPayments);
router.get('/:id', auth(), rbac('payments.view'), getPayment);
router.post('/', auth(), rbac('payments.create'), validateDto(CreatePaymentDto), createPayment);
router.patch('/:id/pay', auth(), rbac('payments.update'), markAsPaid);
router.patch('/:id/refund', auth(), rbac('payments.update'), validateDto(RefundPaymentDto), refundPayment);

export default router;
