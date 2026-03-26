import { Router } from 'express';
import { listReviews, getReview, createReview, updateReview, adminReply, deleteReview } from './review.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateReviewDto, UpdateReviewDto, AdminReplyDto } from './dto/review.dto';

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Course reviews
 */
const router = Router();

router.get('/', listReviews);
router.get('/:id', getReview);
router.post('/', auth(), validateDto(CreateReviewDto), createReview);
router.put('/:id', auth(), validateDto(UpdateReviewDto), updateReview);
router.post('/:id/reply', auth(), rbac('reviews.update'), validateDto(AdminReplyDto), adminReply);
router.delete('/:id', auth(), rbac('reviews.delete'), deleteReview);

export default router;
