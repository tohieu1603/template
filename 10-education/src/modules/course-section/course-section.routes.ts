import { Router } from 'express';
import { listSections, getSectionsByCourse, getSection, createSection, updateSection, deleteSection } from './course-section.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateCourseSectionDto, UpdateCourseSectionDto } from './dto/course-section.dto';

/**
 * @swagger
 * tags:
 *   name: CourseSections
 *   description: Course sections/chapters
 */
const router = Router();

router.get('/', listSections);
router.get('/course/:courseId', getSectionsByCourse);
router.get('/:id', getSection);
router.post('/', auth(), rbac('course_sections.create'), validateDto(CreateCourseSectionDto), createSection);
router.put('/:id', auth(), rbac('course_sections.update'), validateDto(UpdateCourseSectionDto), updateSection);
router.delete('/:id', auth(), rbac('course_sections.delete'), deleteSection);

export default router;
