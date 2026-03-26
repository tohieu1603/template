import { Router } from 'express';
import { getStats } from './dashboard.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';

const router = Router();

router.get('/stats', auth(), rbac('dashboard.view'), getStats);

export default router;
