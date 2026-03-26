import { Router } from 'express';
import { listPayments, getPayment, processPayment, markPaid, refundPayment } from './payment.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { ProcessPaymentDto, RefundPaymentDto, PaymentQueryDto } from './dto/payment.dto';

const router = Router();

router.get('/', auth(), rbac('payments.view'), validateDto(PaymentQueryDto, 'query'), listPayments);
router.get('/:id', auth(), rbac('payments.view'), getPayment);
router.post('/', auth(), rbac('payments.create'), validateDto(ProcessPaymentDto), processPayment);
router.patch('/:id/paid', auth(), rbac('payments.update'), markPaid);
router.patch('/:id/refund', auth(), rbac('payments.update'), validateDto(RefundPaymentDto), refundPayment);

export default router;
