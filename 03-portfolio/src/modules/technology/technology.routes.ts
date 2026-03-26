import { Router } from 'express';
import { listTechnologies, getTechnology, createTechnology, updateTechnology, deleteTechnology } from './technology.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { CreateTechnologyDto, UpdateTechnologyDto, TechnologyQueryDto } from './dto/technology.dto';

const router = Router();

router.get('/', validateDto(TechnologyQueryDto, 'query'), listTechnologies);
router.get('/:id', getTechnology);
router.post('/', auth(), rbac('technologies.create'), validateDto(CreateTechnologyDto), createTechnology);
router.put('/:id', auth(), rbac('technologies.update'), validateDto(UpdateTechnologyDto), updateTechnology);
router.delete('/:id', auth(), rbac('technologies.delete'), deleteTechnology);

export default router;
