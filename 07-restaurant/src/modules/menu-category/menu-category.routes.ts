import { Router } from 'express';
import { listCategories, getCategory, createCategory, updateCategory, deleteCategory } from './menu-category.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { CreateMenuCategoryDto, UpdateMenuCategoryDto, MenuCategoryQueryDto } from './dto/menu-category.dto';

const router = Router();

router.get('/', validateDto(MenuCategoryQueryDto, 'query'), listCategories);
router.get('/:id', getCategory);
router.post('/', auth(), rbac('menu_categories.create'), validateDto(CreateMenuCategoryDto), createCategory);
router.put('/:id', auth(), rbac('menu_categories.update'), validateDto(UpdateMenuCategoryDto), updateCategory);
router.delete('/:id', auth(), rbac('menu_categories.delete'), deleteCategory);

export default router;
