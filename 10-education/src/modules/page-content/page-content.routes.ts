import { Router } from 'express';
import { listPages, getPage, createPage, updatePage, deletePage } from './page-content.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreatePageContentDto, UpdatePageContentDto } from './dto/page-content.dto';

/**
 * @swagger
 * tags:
 *   name: Pages
 *   description: Static page content
 */
const router = Router();

router.get('/', listPages);
router.get('/:slug', getPage);
router.post('/', auth(), rbac('pages.create'), validateDto(CreatePageContentDto), createPage);
router.put('/:slug', auth(), rbac('pages.update'), validateDto(UpdatePageContentDto), updatePage);
router.delete('/:slug', auth(), rbac('pages.delete'), deletePage);

export default router;
