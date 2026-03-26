import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { getReactions, toggleReaction, removeReaction } from './reaction.controller';
import { UpsertReactionDto } from './dto/reaction.dto';

// Mounted at /posts/:postId/reactions
const router = Router({ mergeParams: true });

// Public: get reactions (auth optional for user's own reaction)
router.get('/', getReactions);

// Authenticated: toggle or remove reaction
router.post('/', auth(), validateDto(UpsertReactionDto), toggleReaction);
router.delete('/', auth(), removeReaction);

export default router;
