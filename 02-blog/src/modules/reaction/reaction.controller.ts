import { Request, Response, NextFunction } from 'express';
import { ReactionService } from './reaction.service';
import { successResponse } from '../../common/dto/api-response.dto';

const reactionService = new ReactionService();

/**
 * @swagger
 * tags:
 *   name: Reactions
 *   description: Post reactions (like, love, insightful, funny, sad)
 */

export async function getReactions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let result;
    if (req.user) {
      result = await reactionService.getPostReactionsForUser(req.params.postId, req.user.id);
    } else {
      result = await reactionService.getPostReactions(req.params.postId);
    }
    res.json(successResponse(result));
  } catch (error) { next(error); }
}

export async function toggleReaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await reactionService.toggleReaction(req.params.postId, req.user!.id, req.body);
    const message = result.removed ? 'Reaction removed' : 'Reaction updated';
    res.json(successResponse(result, message));
  } catch (error) { next(error); }
}

export async function removeReaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await reactionService.removeReaction(req.params.postId, req.user!.id);
    res.json(successResponse(null, 'Reaction removed'));
  } catch (error) { next(error); }
}
