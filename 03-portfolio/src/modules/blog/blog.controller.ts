import { Request, Response, NextFunction } from 'express';
import { BlogService } from './blog.service';
import { successResponse } from '../../common/dto/api-response.dto';

const blogService = new BlogService();

/**
 * @swagger
 * tags:
 *   - name: BlogCategories
 *     description: Blog category management
 *   - name: BlogTags
 *     description: Blog tag management
 *   - name: BlogPosts
 *     description: Blog post management
 */

// Categories
export async function listBlogCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await blogService.findAllCategories(req.query as any);
    res.json(successResponse(result.categories, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getBlogCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cat = await blogService.findCategoryById(req.params.id);
    res.json(successResponse(cat));
  } catch (error) { next(error); }
}

export async function createBlogCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cat = await blogService.createCategory(req.body);
    res.status(201).json(successResponse(cat, 'Blog category created'));
  } catch (error) { next(error); }
}

export async function updateBlogCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cat = await blogService.updateCategory(req.params.id, req.body);
    res.json(successResponse(cat, 'Blog category updated'));
  } catch (error) { next(error); }
}

export async function deleteBlogCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await blogService.deleteCategory(req.params.id);
    res.json(successResponse(null, 'Blog category deleted'));
  } catch (error) { next(error); }
}

// Tags
export async function listBlogTags(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await blogService.findAllTags(req.query as any);
    res.json(successResponse(result.tags, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getBlogTag(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tag = await blogService.findTagById(req.params.id);
    res.json(successResponse(tag));
  } catch (error) { next(error); }
}

export async function createBlogTag(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tag = await blogService.createTag(req.body);
    res.status(201).json(successResponse(tag, 'Blog tag created'));
  } catch (error) { next(error); }
}

export async function updateBlogTag(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tag = await blogService.updateTag(req.params.id, req.body);
    res.json(successResponse(tag, 'Blog tag updated'));
  } catch (error) { next(error); }
}

export async function deleteBlogTag(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await blogService.deleteTag(req.params.id);
    res.json(successResponse(null, 'Blog tag deleted'));
  } catch (error) { next(error); }
}

// Posts
export async function listBlogPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await blogService.findAllPosts(req.query as any);
    res.json(successResponse(result.posts, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getBlogPostBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await blogService.findPostBySlug(req.params.slug);
    await blogService.incrementViewCount(post.id);
    res.json(successResponse(post));
  } catch (error) { next(error); }
}

export async function getBlogPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await blogService.findPostById(req.params.id);
    res.json(successResponse(post));
  } catch (error) { next(error); }
}

export async function createBlogPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await blogService.createPost(req.body);
    res.status(201).json(successResponse(post, 'Blog post created'));
  } catch (error) { next(error); }
}

export async function updateBlogPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await blogService.updatePost(req.params.id, req.body);
    res.json(successResponse(post, 'Blog post updated'));
  } catch (error) { next(error); }
}

export async function deleteBlogPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await blogService.deletePost(req.params.id);
    res.json(successResponse(null, 'Blog post deleted'));
  } catch (error) { next(error); }
}
