import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { getWishlist, toggleWishlist, checkWishlist } from './wishlist.controller';

const router = Router();

router.use(auth());
router.get('/', getWishlist);
router.post('/:productId', toggleWishlist);
router.get('/:productId/check', checkWishlist);

export default router;
