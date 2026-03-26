import { Router } from 'express';
import {
  listPages, getPage, getPageBySlug, createPage, updatePage,
  publishPage, unpublishPage, duplicatePage, deletePage,
} from './page.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreatePageDto, UpdatePageDto } from './dto/page.dto';

const router = Router();

router.get('/', listPages);
router.get('/slug/:slug', getPageBySlug);
router.get('/:id', getPage);
router.post('/', auth(), rbac('pages.create'), validateDto(CreatePageDto), createPage);
router.put('/:id', auth(), rbac('pages.update'), validateDto(UpdatePageDto), updatePage);
router.post('/:id/publish', auth(), rbac('pages.update'), publishPage);
router.post('/:id/unpublish', auth(), rbac('pages.update'), unpublishPage);
router.post('/:id/duplicate', auth(), rbac('pages.create'), duplicatePage);
router.delete('/:id', auth(), rbac('pages.delete'), deletePage);

export default router;
