import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { getPostComments, createComment, updateComment, deleteComment, likeComment } from './comment.controller';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

const router = Router();

// Public: get comments for a post
router.get('/post/:postId', getPostComments);

// Authenticated endpoints
router.post('/', auth(), validateDto(CreateCommentDto), createComment);
router.put('/:id', auth(), validateDto(UpdateCommentDto), updateComment);
router.delete('/:id', auth(), deleteComment);
router.post('/:id/like', auth(), likeComment);

export default router;
