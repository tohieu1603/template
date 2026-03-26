import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listPayments, getOrderPayments, processPayment, refundPayment } from './payment.controller';
import { ProcessPaymentDto, RefundPaymentDto } from './dto/payment.dto';

const router = Router();

router.use(auth());
router.get('/', rbac('payments.view'), listPayments);
router.get('/order/:orderId', getOrderPayments);
router.post('/', validateDto(ProcessPaymentDto), processPayment);
router.post('/:id/refund', rbac('payments.update'), validateDto(RefundPaymentDto), refundPayment);

export default router;
