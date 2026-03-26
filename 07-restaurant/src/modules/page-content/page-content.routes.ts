import { Router } from 'express';
import { listPages, getPage, getPageBySlug, createPage, updatePage, deletePage } from './page-content.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { CreatePageContentDto, UpdatePageContentDto, PageContentQueryDto } from './dto/page-content.dto';

const router = Router();

router.get('/', validateDto(PageContentQueryDto, 'query'), listPages);
router.get('/slug/:slug', getPageBySlug);
router.get('/:id', getPage);
router.post('/', auth(), rbac('pages.create'), validateDto(CreatePageContentDto), createPage);
router.put('/:id', auth(), rbac('pages.update'), validateDto(UpdatePageContentDto), updatePage);
router.delete('/:id', auth(), rbac('pages.delete'), deletePage);

export default router;
