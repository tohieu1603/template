import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listApiKeys, createApiKey, revokeApiKey, rotateApiKey } from './api-key.controller';
import { CreateApiKeyDto, ApiKeyQueryDto } from './dto/api-key.dto';

/**
 * @swagger
 * tags:
 *   name: ApiKeys
 *   description: API key management
 */

const router = Router({ mergeParams: true });

router.get('/', auth(), validateDto(ApiKeyQueryDto, 'query'), listApiKeys);
router.post('/', auth(), validateDto(CreateApiKeyDto), createApiKey);
router.delete('/:id', auth(), revokeApiKey);
router.post('/:id/rotate', auth(), rotateApiKey);

export default router;
