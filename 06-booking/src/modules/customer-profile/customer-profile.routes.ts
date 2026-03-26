import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateCustomerProfileDto, UpdateCustomerProfileDto, CustomerProfileQueryDto } from './dto/customer-profile.dto';
import {
  listProfiles, getMyProfile, getProfile, createProfile,
  updateMyProfile, updateProfile, deleteProfile,
} from './customer-profile.controller';

const router = Router();

router.get('/', auth(), rbac('customer_profiles.view'), validateDto(CustomerProfileQueryDto, 'query'), listProfiles);
router.get('/me', auth(), getMyProfile);
router.get('/:id', auth(), rbac('customer_profiles.view'), getProfile);
router.post('/', auth(), validateDto(CreateCustomerProfileDto), createProfile);
router.put('/me', auth(), validateDto(UpdateCustomerProfileDto), updateMyProfile);
router.put('/:id', auth(), rbac('customer_profiles.update'), validateDto(UpdateCustomerProfileDto), updateProfile);
router.delete('/:id', auth(), rbac('customer_profiles.delete'), deleteProfile);

export default router;
