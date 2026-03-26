import { Router } from 'express';
import { listActivityLogs } from './activity-log.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';

/**
 * @swagger
 * tags:
 *   name: ActivityLogs
 *   description: Admin activity logs
 */
const router = Router();

router.get('/', auth(), rbac('activity_logs.view'), listActivityLogs);

export default router;
