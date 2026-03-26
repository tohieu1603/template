import { Router } from 'express';
import { listEnrollments, getMyEnrollments, getEnrollment, enroll, updateProgress } from './enrollment.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { EnrollDto } from './dto/enrollment.dto';

/**
 * @swagger
 * tags:
 *   name: Enrollments
 *   description: Course enrollments and progress
 */
const router = Router();

router.get('/', auth(), rbac('enrollments.view'), listEnrollments);
router.get('/my', auth(), getMyEnrollments);
router.get('/:id', auth(), getEnrollment);
router.post('/', auth(), validateDto(EnrollDto), enroll);
router.put('/:id/progress', auth(), updateProgress);

export default router;
