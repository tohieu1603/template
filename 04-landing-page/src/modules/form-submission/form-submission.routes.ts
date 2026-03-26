import { Router } from 'express';
import { listSubmissions, getSubmission, submitForm, markSubmissionRead, deleteSubmission } from './form-submission.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateFormSubmissionDto } from './dto/form-submission.dto';

const router = Router();

router.post('/', validateDto(CreateFormSubmissionDto), submitForm);
router.get('/', auth(), rbac('forms.view'), listSubmissions);
router.get('/:id', auth(), rbac('forms.view'), getSubmission);
router.put('/:id/read', auth(), rbac('forms.update'), markSubmissionRead);
router.delete('/:id', auth(), rbac('forms.delete'), deleteSubmission);

export default router;
