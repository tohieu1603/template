import { Router } from 'express';
import { listInstructors, getInstructor, createInstructor, updateInstructor, verifyInstructor, deleteInstructor } from './instructor.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateInstructorDto, UpdateInstructorDto } from './dto/instructor.dto';

/**
 * @swagger
 * tags:
 *   name: Instructors
 *   description: Instructor profiles
 */
const router = Router();

router.get('/', listInstructors);
router.get('/:slug', getInstructor);
router.post('/', auth(), rbac('instructors.create'), validateDto(CreateInstructorDto), createInstructor);
router.put('/:id', auth(), rbac('instructors.update'), validateDto(UpdateInstructorDto), updateInstructor);
router.put('/:id/verify', auth(), rbac('instructors.update'), verifyInstructor);
router.delete('/:id', auth(), rbac('instructors.delete'), deleteInstructor);

export default router;
