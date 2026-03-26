import { Router } from 'express';
import { listActivityLogs } from './activity-log.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { ActivityLogQueryDto } from './dto/activity-log.dto';

const router = Router();

router.get('/', auth(), rbac('activity_logs.view'), validateDto(ActivityLogQueryDto, 'query'), listActivityLogs);

export default router;
