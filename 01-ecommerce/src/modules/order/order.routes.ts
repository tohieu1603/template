import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listOrders, getOrder, createOrder, updateOrderStatus, cancelOrder } from './order.controller';
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './dto/order.dto';

const router = Router();

router.use(auth());
router.get('/', validateDto(OrderQueryDto, 'query'), listOrders);
router.post('/', validateDto(CreateOrderDto), createOrder);
router.get('/:id', getOrder);
router.put('/:id/status', rbac('orders.update'), validateDto(UpdateOrderStatusDto), updateOrderStatus);
router.post('/:id/cancel', cancelOrder);

export default router;
