import { Router } from 'express';
import {
  listSectionsByPage, getSection, createSection, updateSection,
  toggleSectionVisibility, reorderSections, deleteSection,
} from './page-section.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreatePageSectionDto, UpdatePageSectionDto } from './dto/page-section.dto';

const router = Router();

router.get('/by-page/:pageId', listSectionsByPage);
router.get('/:id', getSection);
router.post('/', auth(), rbac('pages.create'), validateDto(CreatePageSectionDto), createSection);
router.put('/reorder', auth(), rbac('pages.update'), reorderSections);
router.put('/:id', auth(), rbac('pages.update'), validateDto(UpdatePageSectionDto), updateSection);
router.patch('/:id/toggle-visibility', auth(), rbac('pages.update'), toggleSectionVisibility);
router.delete('/:id', auth(), rbac('pages.delete'), deleteSection);

export default router;
