import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateHolidayDto, UpdateHolidayDto, HolidayQueryDto } from './dto/holiday.dto';
import { listHolidays, getHoliday, createHoliday, updateHoliday, deleteHoliday } from './holiday.controller';

const router = Router();

router.get('/', validateDto(HolidayQueryDto, 'query'), listHolidays);
router.get('/:id', getHoliday);
router.post('/', auth(), rbac('holidays.create'), validateDto(CreateHolidayDto), createHoliday);
router.put('/:id', auth(), rbac('holidays.update'), validateDto(UpdateHolidayDto), updateHoliday);
router.delete('/:id', auth(), rbac('holidays.delete'), deleteHoliday);

export default router;
