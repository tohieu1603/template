import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listSubscriptions, getCurrentSubscription, createSubscription, upgradeSubscription, cancelSubscription } from './subscription.controller';
import { CreateSubscriptionDto, UpdateSubscriptionDto, SubscriptionQueryDto } from './dto/subscription.dto';

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Subscription management
 */

const router = Router({ mergeParams: true });

router.get('/', auth(), rbac('subscriptions.view'), validateDto(SubscriptionQueryDto, 'query'), listSubscriptions);
router.get('/current', auth(), getCurrentSubscription);
router.post('/', auth(), validateDto(CreateSubscriptionDto), createSubscription);
router.put('/', auth(), validateDto(UpdateSubscriptionDto), upgradeSubscription);
router.delete('/cancel', auth(), cancelSubscription);

export default router;
