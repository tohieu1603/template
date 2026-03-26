import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listCategories, getCategoryTree, getCategory, createCategory, updateCategory, deleteCategory } from './category.controller';
import { CreateCategoryDto, UpdateCategoryDto, CategoryQueryDto } from './dto/category.dto';

const router = Router();

router.get('/', validateDto(CategoryQueryDto, 'query'), listCategories);
router.get('/tree', getCategoryTree);
router.get('/:id', getCategory);
router.post('/', auth(), rbac('categories.create'), validateDto(CreateCategoryDto), createCategory);
router.put('/:id', auth(), rbac('categories.update'), validateDto(UpdateCategoryDto), updateCategory);
router.delete('/:id', auth(), rbac('categories.delete'), deleteCategory);

export default router;
