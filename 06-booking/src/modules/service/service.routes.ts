import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateServiceDto, UpdateServiceDto, ServiceQueryDto } from './dto/service.dto';
import { listServices, getService, createService, updateService, deleteService } from './service.controller';

const router = Router();

router.get('/', validateDto(ServiceQueryDto, 'query'), listServices);
router.get('/:id', getService);
router.post('/', auth(), rbac('services.create'), validateDto(CreateServiceDto), createService);
router.put('/:id', auth(), rbac('services.update'), validateDto(UpdateServiceDto), updateService);
router.delete('/:id', auth(), rbac('services.delete'), deleteService);

export default router;
