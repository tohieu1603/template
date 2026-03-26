import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listLogs, deleteLog } from './activity-log.controller';
import { ActivityLogQueryDto } from './dto/activity-log.dto';

/**
 * @swagger
 * tags:
 *   name: ActivityLogs
 *   description: Audit trail logs
 */

const router = Router();

router.get('/', auth(), rbac('activity_logs.view'), validateDto(ActivityLogQueryDto, 'query'), listLogs);
router.delete('/:id', auth(), rbac('activity_logs.delete'), deleteLog);

export default router;
