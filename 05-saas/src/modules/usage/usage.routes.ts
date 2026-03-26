import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { recordUsage, getCurrentPeriodUsage, getUsageHistory } from './usage.controller';
import { RecordUsageDto, UsageQueryDto } from './dto/usage.dto';

/**
 * @swagger
 * tags:
 *   name: Usage
 *   description: Usage tracking
 */

const router = Router({ mergeParams: true });

router.post('/', auth(), validateDto(RecordUsageDto), recordUsage);
router.get('/current', auth(), getCurrentPeriodUsage);
router.get('/history', auth(), validateDto(UsageQueryDto, 'query'), getUsageHistory);

export default router;
