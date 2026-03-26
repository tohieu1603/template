import { Router } from 'express';
import { listItems, getItem, createItem, updateItem, deleteItem, addOption, deleteOption, addOptionValue, deleteOptionValue } from './menu-item.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { CreateMenuItemDto, UpdateMenuItemDto, MenuItemQueryDto, CreateMenuItemOptionDto, CreateMenuOptionValueDto } from './dto/menu-item.dto';

const router = Router();

router.get('/', validateDto(MenuItemQueryDto, 'query'), listItems);
router.get('/:id', getItem);
router.post('/', auth(), rbac('menu_items.create'), validateDto(CreateMenuItemDto), createItem);
router.put('/:id', auth(), rbac('menu_items.update'), validateDto(UpdateMenuItemDto), updateItem);
router.delete('/:id', auth(), rbac('menu_items.delete'), deleteItem);

// Options sub-resource
router.post('/:id/options', auth(), rbac('menu_items.update'), validateDto(CreateMenuItemOptionDto), addOption);
router.delete('/:id/options/:optId', auth(), rbac('menu_items.update'), deleteOption);

// Option values sub-resource
router.post('/:id/options/:optId/values', auth(), rbac('menu_items.update'), validateDto(CreateMenuOptionValueDto), addOptionValue);
router.delete('/:id/options/:optId/values/:valueId', auth(), rbac('menu_items.update'), deleteOptionValue);

export default router;
