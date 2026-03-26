import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listSubscribers, subscribe, unsubscribe, deleteSubscriber } from './newsletter.controller';
import { SubscribeNewsletterDto, UnsubscribeNewsletterDto } from './dto/newsletter.dto';

const router = Router();

// Public
router.post('/subscribe', validateDto(SubscribeNewsletterDto), subscribe);
router.post('/unsubscribe', validateDto(UnsubscribeNewsletterDto), unsubscribe);

// Admin
router.get('/', auth(), rbac('newsletter.view'), listSubscribers);
router.delete('/:id', auth(), rbac('newsletter.delete'), deleteSubscriber);

export default router;
