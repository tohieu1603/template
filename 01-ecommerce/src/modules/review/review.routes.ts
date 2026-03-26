import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import {
  listReviews, getReview, createReview, updateReview, adminUpdateReview, deleteReview, getProductStats,
} from './review.controller';
import { CreateReviewDto, UpdateReviewDto, AdminReviewDto, ReviewQueryDto } from './dto/review.dto';

const router = Router();

router.get('/', validateDto(ReviewQueryDto, 'query'), listReviews);
router.get('/stats/:productId', getProductStats);
router.get('/:id', getReview);
router.post('/', auth(), validateDto(CreateReviewDto), createReview);
router.put('/:id', auth(), validateDto(UpdateReviewDto), updateReview);
router.patch('/:id/admin', auth(), rbac('reviews.update'), validateDto(AdminReviewDto), adminUpdateReview);
router.delete('/:id', auth(), deleteReview);

export default router;
