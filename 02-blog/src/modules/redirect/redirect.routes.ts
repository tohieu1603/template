import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listRedirects, getRedirect, createRedirect, updateRedirect, deleteRedirect } from './redirect.controller';
import { CreateRedirectDto, UpdateRedirectDto } from './dto/redirect.dto';

const router = Router();

router.get('/', auth(), rbac('redirects.view'), listRedirects);
router.get('/:id', auth(), rbac('redirects.view'), getRedirect);
router.post('/', auth(), rbac('redirects.create'), validateDto(CreateRedirectDto), createRedirect);
router.put('/:id', auth(), rbac('redirects.update'), validateDto(UpdateRedirectDto), updateRedirect);
router.delete('/:id', auth(), rbac('redirects.delete'), deleteRedirect);

export default router;
