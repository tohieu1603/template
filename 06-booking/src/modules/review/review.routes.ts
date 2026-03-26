import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateReviewDto, UpdateReviewDto, ReplyReviewDto, ReviewQueryDto } from './dto/review.dto';
import { listReviews, getReview, createReview, updateReview, replyToReview, deleteReview } from './review.controller';

const router = Router();

router.get('/', validateDto(ReviewQueryDto, 'query'), listReviews);
router.get('/:id', getReview);
router.post('/', auth(), validateDto(CreateReviewDto), createReview);
router.put('/:id', auth(), validateDto(UpdateReviewDto), updateReview);
router.post('/:id/reply', auth(), rbac('reviews.update'), validateDto(ReplyReviewDto), replyToReview);
router.delete('/:id', auth(), rbac('reviews.delete'), deleteReview);

export default router;
