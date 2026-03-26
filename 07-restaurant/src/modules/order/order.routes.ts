import { Router } from 'express';
import { listOrders, getOrder, createOrder, confirmOrder, prepareOrder, readyOrder, serveOrder, completeOrder, cancelOrder, getOrderHistory } from './order.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { CreateOrderDto, CancelOrderDto, OrderQueryDto } from './dto/order.dto';

const router = Router();

router.get('/', auth(), rbac('orders.view'), validateDto(OrderQueryDto, 'query'), listOrders);
router.get('/:id', auth(), rbac('orders.view'), getOrder);
router.get('/:id/history', auth(), rbac('orders.view'), getOrderHistory);
router.post('/', auth(), validateDto(CreateOrderDto), createOrder);
router.patch('/:id/confirm', auth(), rbac('orders.update'), confirmOrder);
router.patch('/:id/prepare', auth(), rbac('orders.update'), prepareOrder);
router.patch('/:id/ready', auth(), rbac('orders.update'), readyOrder);
router.patch('/:id/serve', auth(), rbac('orders.update'), serveOrder);
router.patch('/:id/complete', auth(), rbac('orders.update'), completeOrder);
router.patch('/:id/cancel', auth(), validateDto(CancelOrderDto), cancelOrder);

export default router;
