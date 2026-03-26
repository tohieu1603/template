import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { listActivityLogs } from './activity-log.controller';

const router = Router();

router.get('/', auth(), rbac('activity_logs.view'), listActivityLogs);

export default router;
