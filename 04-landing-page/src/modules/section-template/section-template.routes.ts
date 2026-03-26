import { Router } from 'express';
import { listTemplates, getTemplate, createTemplate, updateTemplate, deleteTemplate } from './section-template.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateSectionTemplateDto, UpdateSectionTemplateDto } from './dto/section-template.dto';

const router = Router();

router.get('/', listTemplates);
router.get('/:id', getTemplate);
router.post('/', auth(), rbac('pages.create'), validateDto(CreateSectionTemplateDto), createTemplate);
router.put('/:id', auth(), rbac('pages.update'), validateDto(UpdateSectionTemplateDto), updateTemplate);
router.delete('/:id', auth(), rbac('pages.delete'), deleteTemplate);

export default router;
