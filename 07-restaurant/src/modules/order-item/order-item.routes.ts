import { Router } from 'express';
import { getOrderItem, updateOrderItemStatus } from './order-item.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { UpdateOrderItemStatusDto } from './dto/order-item.dto';

const router = Router();

router.get('/:id', auth(), rbac('orders.view'), getOrderItem);
router.patch('/:id/status', auth(), rbac('orders.update'), validateDto(UpdateOrderItemStatusDto), updateOrderItemStatus);

export default router;
