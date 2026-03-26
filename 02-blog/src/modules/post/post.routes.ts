import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import {
  listPosts, getPost, getPostBySlug, createPost, updatePost,
  publishPost, unpublishPost, deletePost, getPostRevisions,
} from './post.controller';
import { CreatePostDto, UpdatePostDto, PostQueryDto } from './dto/post.dto';

const router = Router();

// Public endpoints
router.get('/', validateDto(PostQueryDto, 'query'), listPosts);
router.get('/slug/:slug', getPostBySlug);
router.get('/:id', getPost);

// Authenticated endpoints
router.get('/:id/revisions', auth(), getPostRevisions);

// Admin / author endpoints
router.post('/', auth(), rbac('posts.create'), validateDto(CreatePostDto), createPost);
router.put('/:id', auth(), rbac('posts.update'), validateDto(UpdatePostDto), updatePost);
router.put('/:id/publish', auth(), rbac('posts.publish'), publishPost);
router.put('/:id/unpublish', auth(), rbac('posts.update'), unpublishPost);
router.delete('/:id', auth(), rbac('posts.delete'), deletePost);

export default router;
