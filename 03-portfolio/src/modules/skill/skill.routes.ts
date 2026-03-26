import { Router } from 'express';
import { listSkills, getSkill, createSkill, updateSkill, deleteSkill } from './skill.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { CreateSkillDto, UpdateSkillDto, SkillQueryDto } from './dto/skill.dto';

const router = Router();

router.get('/', validateDto(SkillQueryDto, 'query'), listSkills);
router.get('/:id', getSkill);
router.post('/', auth(), rbac('skills.create'), validateDto(CreateSkillDto), createSkill);
router.put('/:id', auth(), rbac('skills.update'), validateDto(UpdateSkillDto), updateSkill);
router.delete('/:id', auth(), rbac('skills.delete'), deleteSkill);

export default router;
