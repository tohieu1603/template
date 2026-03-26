import { Request, Response, NextFunction } from 'express';
import { PostService } from './post.service';
import { successResponse } from '../../common/dto/api-response.dto';

const postService = new PostService();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Blog post management
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     tags: [Posts]
 *     summary: List posts with pagination, search, and filters
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [draft, published, archived] }
 *       - in: query
 *         name: categoryId
 *         schema: { type: string }
 *       - in: query
 *         name: authorId
 *         schema: { type: string }
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *       - in: query
 *         name: isFeatured
 *         schema: { type: string, enum: [true] }
 *       - in: query
 *         name: isTrending
 *         schema: { type: string, enum: [true] }
 *     responses:
 *       200:
 *         description: Paginated post list
 */
export async function listPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { posts, meta } = await postService.findAll(req.query as any);
    res.json(successResponse(posts, undefined, meta));
  } catch (error) { next(error); }
}

export async function getPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await postService.findById(req.params.id);
    // Increment view count async (fire and forget)
    postService.incrementViewCount(req.params.id).catch(() => {});
    res.json(successResponse(post));
  } catch (error) { next(error); }
}

export async function getPostBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await postService.findBySlug(req.params.slug);
    // Increment view count async (fire and forget)
    postService.incrementViewCount((post as any).id).catch(() => {});
    res.json(successResponse(post));
  } catch (error) { next(error); }
}

/**
 * @swagger
 * /posts:
 *   post:
 *     tags: [Posts]
 *     summary: Create a new post
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [authorId, title]
 *             properties:
 *               authorId: { type: string }
 *               title: { type: string }
 *               content: { type: string }
 *               status: { type: string, enum: [draft, published, archived] }
 *     responses:
 *       201:
 *         description: Post created
 */
export async function createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await postService.create(req.body);
    res.status(201).json(successResponse(post, 'Post created'));
  } catch (error) { next(error); }
}

export async function updatePost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await postService.update(req.params.id, req.body, req.user!.id);
    res.json(successResponse(post, 'Post updated'));
  } catch (error) { next(error); }
}

export async function publishPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await postService.publish(req.params.id);
    res.json(successResponse(post, 'Post published'));
  } catch (error) { next(error); }
}

export async function unpublishPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await postService.unpublish(req.params.id);
    res.json(successResponse(post, 'Post unpublished'));
  } catch (error) { next(error); }
}

export async function deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await postService.delete(req.params.id);
    res.json(successResponse(null, 'Post deleted'));
  } catch (error) { next(error); }
}

export async function getPostRevisions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const revisions = await postService.getRevisions(req.params.id);
    res.json(successResponse(revisions));
  } catch (error) { next(error); }
}
