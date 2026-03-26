import { Router } from 'express';
import { listCourses, getCourse, getCourseById, createCourse, updateCourse, publishCourse, unpublishCourse, deleteCourse } from './course.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management
 */
const router = Router();

router.get('/', listCourses);
router.get('/id/:id', getCourseById);
router.get('/:slug', getCourse);
router.post('/', auth(), rbac('courses.create'), validateDto(CreateCourseDto), createCourse);
router.put('/:id', auth(), rbac('courses.update'), validateDto(UpdateCourseDto), updateCourse);
router.put('/:id/publish', auth(), rbac('courses.update'), publishCourse);
router.put('/:id/unpublish', auth(), rbac('courses.update'), unpublishCourse);
router.delete('/:id', auth(), rbac('courses.delete'), deleteCourse);

export default router;
