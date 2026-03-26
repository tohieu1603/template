import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from './cart.controller';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

const router = Router();

router.use(auth());
router.get('/', getCart);
router.post('/', validateDto(AddToCartDto), addToCart);
router.put('/:id', validateDto(UpdateCartItemDto), updateCartItem);
router.delete('/:id', removeCartItem);
router.delete('/', clearCart);

export default router;
