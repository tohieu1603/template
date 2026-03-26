import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { listPages, getPageBySlug, getPage, createPage, updatePage, deletePage } from './page-content.controller';

const router = Router();

// Public
router.get('/slug/:slug', getPageBySlug);

// Admin management
router.get('/', auth(), rbac('pages.view'), listPages);
router.post('/', auth(), rbac('pages.create'), createPage);
router.get('/:id', auth(), rbac('pages.view'), getPage);
router.put('/:id', auth(), rbac('pages.update'), updatePage);
router.delete('/:id', auth(), rbac('pages.delete'), deletePage);

export default router;
