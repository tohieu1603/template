import { Router } from 'express';
import { listExperiences, getExperience, createExperience, updateExperience, deleteExperience } from './experience.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { CreateExperienceDto, UpdateExperienceDto, ExperienceQueryDto } from './dto/experience.dto';

const router = Router();

router.get('/', validateDto(ExperienceQueryDto, 'query'), listExperiences);
router.get('/:id', getExperience);
router.post('/', auth(), rbac('experiences.create'), validateDto(CreateExperienceDto), createExperience);
router.put('/:id', auth(), rbac('experiences.update'), validateDto(UpdateExperienceDto), updateExperience);
router.delete('/:id', auth(), rbac('experiences.delete'), deleteExperience);

export default router;
