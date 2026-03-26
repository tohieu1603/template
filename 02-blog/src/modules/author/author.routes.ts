import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listAuthors, getAuthor, getAuthorBySlug, createAuthor, updateAuthor, deleteAuthor } from './author.controller';
import { CreateAuthorDto, UpdateAuthorDto, AuthorQueryDto } from './dto/author.dto';

const router = Router();

// Public endpoints
router.get('/', validateDto(AuthorQueryDto, 'query'), listAuthors);
router.get('/slug/:slug', getAuthorBySlug);
router.get('/:id', getAuthor);

// Admin endpoints
router.post('/', auth(), rbac('authors.create'), validateDto(CreateAuthorDto), createAuthor);
router.put('/:id', auth(), rbac('authors.update'), validateDto(UpdateAuthorDto), updateAuthor);
router.delete('/:id', auth(), rbac('authors.delete'), deleteAuthor);

export default router;
