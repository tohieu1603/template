import { Router } from 'express';
import { listReviews, getReview, createReview, updateReview, deleteReview, adminReply, toggleVisibility } from './review.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { CreateReviewDto, UpdateReviewDto, AdminReplyDto, ReviewQueryDto } from './dto/review.dto';

const router = Router();

router.get('/', validateDto(ReviewQueryDto, 'query'), listReviews);
router.get('/:id', getReview);
router.post('/', auth(), validateDto(CreateReviewDto), createReview);
router.put('/:id', auth(), validateDto(UpdateReviewDto), updateReview);
router.delete('/:id', auth(), deleteReview);
router.patch('/:id/reply', auth(), rbac('reviews.update'), validateDto(AdminReplyDto), adminReply);
router.patch('/:id/visibility', auth(), rbac('reviews.update'), toggleVisibility);

export default router;
