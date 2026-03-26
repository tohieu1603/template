import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listCategories, getCategoryTree, getCategory, getCategoryBySlug, createCategory, updateCategory, deleteCategory } from './category.controller';
import { CreateCategoryDto, UpdateCategoryDto, CategoryQueryDto } from './dto/category.dto';

const router = Router();

// Public endpoints
router.get('/', validateDto(CategoryQueryDto, 'query'), listCategories);
router.get('/tree', getCategoryTree);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategory);

// Admin endpoints
router.post('/', auth(), rbac('categories.create'), validateDto(CreateCategoryDto), createCategory);
router.put('/:id', auth(), rbac('categories.update'), validateDto(UpdateCategoryDto), updateCategory);
router.delete('/:id', auth(), rbac('categories.delete'), deleteCategory);

export default router;
