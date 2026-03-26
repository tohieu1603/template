import { Router } from 'express';
import { listForms, getForm, getFormBySlug, createForm, updateForm, deleteForm } from './form.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateFormDto, UpdateFormDto } from './dto/form.dto';

const router = Router();

router.get('/', listForms);
router.get('/slug/:slug', getFormBySlug);
router.get('/:id', getForm);
router.post('/', auth(), rbac('forms.create'), validateDto(CreateFormDto), createForm);
router.put('/:id', auth(), rbac('forms.update'), validateDto(UpdateFormDto), updateForm);
router.delete('/:id', auth(), rbac('forms.delete'), deleteForm);

export default router;
