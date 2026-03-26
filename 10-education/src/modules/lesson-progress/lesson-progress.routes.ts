import { Router } from 'express';
import { getProgress, markComplete, updateWatchTime } from './lesson-progress.controller';
import { auth } from '../../common/middleware/auth.middleware';

/**
 * @swagger
 * tags:
 *   name: LessonProgress
 *   description: Lesson completion tracking
 */
const router = Router();

router.get('/:enrollmentId', auth(), getProgress);
router.post('/complete', auth(), markComplete);
router.post('/watch-time', auth(), updateWatchTime);

export default router;
