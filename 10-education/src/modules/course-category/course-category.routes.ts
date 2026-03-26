import { Router } from 'express';
import { listCategories, getCategoryTree, getCategory, createCategory, updateCategory, deleteCategory } from './course-category.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateCourseCategoryDto, UpdateCourseCategoryDto } from './dto/course-category.dto';

/**
 * @swagger
 * tags:
 *   name: CourseCategories
 *   description: Course category management
 */
const router = Router();

router.get('/tree', getCategoryTree);
router.get('/', listCategories);
router.get('/:slug', getCategory);
router.post('/', auth(), rbac('course_categories.create'), validateDto(CreateCourseCategoryDto), createCategory);
router.put('/:id', auth(), rbac('course_categories.update'), validateDto(UpdateCourseCategoryDto), updateCategory);
router.delete('/:id', auth(), rbac('course_categories.delete'), deleteCategory);

export default router;
