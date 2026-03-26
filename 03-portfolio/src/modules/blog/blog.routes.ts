import { Router } from 'express';
import {
  listBlogCategories, getBlogCategory, createBlogCategory, updateBlogCategory, deleteBlogCategory,
  listBlogTags, getBlogTag, createBlogTag, updateBlogTag, deleteBlogTag,
  listBlogPosts, getBlogPost, getBlogPostBySlug, createBlogPost, updateBlogPost, deleteBlogPost,
} from './blog.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import {
  CreateBlogCategoryDto, UpdateBlogCategoryDto,
  CreateBlogTagDto, UpdateBlogTagDto,
  CreateBlogPostDto, UpdateBlogPostDto,
  BlogPostQueryDto, BlogQueryDto,
} from './dto/blog.dto';

const router = Router();

// Categories
router.get('/categories', validateDto(BlogQueryDto, 'query'), listBlogCategories);
router.get('/categories/:id', getBlogCategory);
router.post('/categories', auth(), rbac('blog.create'), validateDto(CreateBlogCategoryDto), createBlogCategory);
router.put('/categories/:id', auth(), rbac('blog.update'), validateDto(UpdateBlogCategoryDto), updateBlogCategory);
router.delete('/categories/:id', auth(), rbac('blog.delete'), deleteBlogCategory);

// Tags
router.get('/tags', validateDto(BlogQueryDto, 'query'), listBlogTags);
router.get('/tags/:id', getBlogTag);
router.post('/tags', auth(), rbac('blog.create'), validateDto(CreateBlogTagDto), createBlogTag);
router.put('/tags/:id', auth(), rbac('blog.update'), validateDto(UpdateBlogTagDto), updateBlogTag);
router.delete('/tags/:id', auth(), rbac('blog.delete'), deleteBlogTag);

// Posts
router.get('/posts', validateDto(BlogPostQueryDto, 'query'), listBlogPosts);
router.get('/posts/slug/:slug', getBlogPostBySlug);
router.get('/posts/:id', getBlogPost);
router.post('/posts', auth(), rbac('blog.create'), validateDto(CreateBlogPostDto), createBlogPost);
router.put('/posts/:id', auth(), rbac('blog.update'), validateDto(UpdateBlogPostDto), updateBlogPost);
router.delete('/posts/:id', auth(), rbac('blog.delete'), deleteBlogPost);

export default router;
