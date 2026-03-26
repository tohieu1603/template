import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateProviderDto, UpdateProviderDto, ProviderQueryDto, CreateWorkingHoursDto, CreateProviderBreakDto, CreateBlockedSlotDto } from './dto/provider.dto';
import {
  listProviders, getProvider, createProvider, updateProvider, deleteProvider,
  getWorkingHours, setWorkingHours, deleteWorkingHours,
  getBreaks, addBreak, deleteBreak,
  getBlockedSlots, addBlockedSlot, deleteBlockedSlot,
} from './provider.controller';

const router = Router();

router.get('/', validateDto(ProviderQueryDto, 'query'), listProviders);
router.get('/:id', getProvider);
router.post('/', auth(), rbac('providers.create'), validateDto(CreateProviderDto), createProvider);
router.put('/:id', auth(), rbac('providers.update'), validateDto(UpdateProviderDto), updateProvider);
router.delete('/:id', auth(), rbac('providers.delete'), deleteProvider);

// Working hours
router.get('/:id/working-hours', getWorkingHours);
router.post('/:id/working-hours', auth(), rbac('providers.update'), validateDto(CreateWorkingHoursDto), setWorkingHours);
router.delete('/:id/working-hours/:whId', auth(), rbac('providers.update'), deleteWorkingHours);

// Breaks
router.get('/:id/breaks', getBreaks);
router.post('/:id/breaks', auth(), rbac('providers.update'), validateDto(CreateProviderBreakDto), addBreak);
router.delete('/:id/breaks/:breakId', auth(), rbac('providers.update'), deleteBreak);

// Blocked slots
router.get('/:id/blocked-slots', getBlockedSlots);
router.post('/:id/blocked-slots', auth(), rbac('providers.update'), validateDto(CreateBlockedSlotDto), addBlockedSlot);
router.delete('/:id/blocked-slots/:slotId', auth(), rbac('providers.update'), deleteBlockedSlot);

export default router;
