import { Router } from 'express';
import { validateDto } from '../../common/middleware/validate.middleware';
import { AvailabilityQueryDto } from './dto/availability.dto';
import { getAvailability } from './availability.controller';

const router = Router();

router.get('/', validateDto(AvailabilityQueryDto, 'query'), getAvailability);

export default router;
