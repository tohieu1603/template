import { Router } from 'express';
import { listProfiles, getProfile, getProfileBySlug, createProfile, updateProfile, deleteProfile } from './profile.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { CreateProfileDto, UpdateProfileDto, ProfileQueryDto } from './dto/profile.dto';

const router = Router();

router.get('/', validateDto(ProfileQueryDto, 'query'), listProfiles);
router.get('/slug/:slug', getProfileBySlug);
router.get('/:id', getProfile);
router.post('/', auth(), rbac('profiles.create'), validateDto(CreateProfileDto), createProfile);
router.put('/:id', auth(), rbac('profiles.update'), validateDto(UpdateProfileDto), updateProfile);
router.delete('/:id', auth(), rbac('profiles.delete'), deleteProfile);

export default router;
