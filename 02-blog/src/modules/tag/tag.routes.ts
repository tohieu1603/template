import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listTags, getTag, getTagBySlug, createTag, updateTag, deleteTag } from './tag.controller';
import { CreateTagDto, UpdateTagDto, TagQueryDto } from './dto/tag.dto';

const router = Router();

// Public endpoints
router.get('/', validateDto(TagQueryDto, 'query'), listTags);
router.get('/slug/:slug', getTagBySlug);
router.get('/:id', getTag);

// Admin endpoints
router.post('/', auth(), rbac('tags.create'), validateDto(CreateTagDto), createTag);
router.put('/:id', auth(), rbac('tags.update'), validateDto(UpdateTagDto), updateTag);
router.delete('/:id', auth(), rbac('tags.delete'), deleteTag);

export default router;
