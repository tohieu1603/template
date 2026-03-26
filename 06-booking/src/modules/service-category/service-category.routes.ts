import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateServiceCategoryDto, UpdateServiceCategoryDto, ServiceCategoryQueryDto } from './dto/service-category.dto';
import { listServiceCategories, getServiceCategory, createServiceCategory, updateServiceCategory, deleteServiceCategory } from './service-category.controller';

const router = Router();

router.get('/', validateDto(ServiceCategoryQueryDto, 'query'), listServiceCategories);
router.get('/:id', getServiceCategory);
router.post('/', auth(), rbac('service_categories.create'), validateDto(CreateServiceCategoryDto), createServiceCategory);
router.put('/:id', auth(), rbac('service_categories.update'), validateDto(UpdateServiceCategoryDto), updateServiceCategory);
router.delete('/:id', auth(), rbac('service_categories.delete'), deleteServiceCategory);

export default router;
