import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listWebhooks, getWebhook, createWebhook, updateWebhook, deleteWebhook, getWebhookLogs } from './webhook.controller';
import { CreateWebhookDto, UpdateWebhookDto, WebhookQueryDto, WebhookLogQueryDto } from './dto/webhook.dto';

/**
 * @swagger
 * tags:
 *   name: Webhooks
 *   description: Webhook management
 */

const router = Router({ mergeParams: true });

router.get('/', auth(), validateDto(WebhookQueryDto, 'query'), listWebhooks);
router.get('/:id', auth(), getWebhook);
router.post('/', auth(), validateDto(CreateWebhookDto), createWebhook);
router.put('/:id', auth(), validateDto(UpdateWebhookDto), updateWebhook);
router.delete('/:id', auth(), deleteWebhook);
router.get('/:id/logs', auth(), validateDto(WebhookLogQueryDto, 'query'), getWebhookLogs);

export default router;
