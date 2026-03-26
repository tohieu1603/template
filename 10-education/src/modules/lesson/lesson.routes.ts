import { Router } from 'express';
import { listLessons, getLesson, createLesson, updateLesson, deleteLesson } from './lesson.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';

/**
 * @swagger
 * tags:
 *   name: Lessons
 *   description: Course lessons
 */
const router = Router();

router.get('/', listLessons);
router.get('/:id', auth(), getLesson);
router.post('/', auth(), rbac('lessons.create'), validateDto(CreateLessonDto), createLesson);
router.put('/:id', auth(), rbac('lessons.update'), validateDto(UpdateLessonDto), updateLesson);
router.delete('/:id', auth(), rbac('lessons.delete'), deleteLesson);

export default router;
