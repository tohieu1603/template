import { Router } from 'express';
import { listHours, getHours, createHours, updateHours, deleteHours } from './operating-hours.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { CreateOperatingHoursDto, UpdateOperatingHoursDto } from './dto/operating-hours.dto';

const router = Router();

router.get('/', listHours);
router.get('/:id', getHours);
router.post('/', auth(), rbac('operating_hours.create'), validateDto(CreateOperatingHoursDto), createHours);
router.put('/:id', auth(), rbac('operating_hours.update'), validateDto(UpdateOperatingHoursDto), updateHours);
router.delete('/:id', auth(), rbac('operating_hours.delete'), deleteHours);

export default router;
