import { Request, Response, NextFunction } from 'express';
import { CommentService } from './comment.service';
import { successResponse } from '../../common/dto/api-response.dto';

const commentService = new CommentService();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Blog comment management
 */

export async function getPostComments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { comments, meta } = await commentService.findByPost(req.params.postId, req.query as any);
    res.json(successResponse(comments, undefined, meta));
  } catch (error) { next(error); }
}

export async function createComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const comment = await commentService.create(req.user!.id, req.body);
    res.status(201).json(successResponse(comment, 'Comment created'));
  } catch (error) { next(error); }
}

export async function updateComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const isAdmin = req.user!.roles.includes('admin') || req.user!.roles.includes('super_admin');
    if (isAdmin) {
      const comment = await commentService.adminUpdate(req.params.id, req.body);
      res.json(successResponse(comment, 'Comment updated'));
    } else {
      const comment = await commentService.update(req.params.id, req.user!.id, req.body);
      res.json(successResponse(comment, 'Comment updated'));
    }
  } catch (error) { next(error); }
}

export async function deleteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const isAdmin = req.user!.roles.includes('admin') || req.user!.roles.includes('super_admin');
    await commentService.delete(req.params.id, req.user!.id, isAdmin);
    res.json(successResponse(null, 'Comment deleted'));
  } catch (error) { next(error); }
}

export async function likeComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await commentService.toggleLike(req.params.id, req.user!.id);
    res.json(successResponse(result));
  } catch (error) { next(error); }
}
