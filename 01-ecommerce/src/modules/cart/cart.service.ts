import { AppDataSource } from '../../config/database.config';
import { CartItem } from './entities/cart-item.entity';
import { ProductVariant } from '../product/entities/product-variant.entity';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { NotFoundError, ValidationError } from '../../common/errors/app-error';

/**
 * Cart service: manages user cart items with stock validation.
 */
export class CartService {
  private cartRepo = AppDataSource.getRepository(CartItem);
  private variantRepo = AppDataSource.getRepository(ProductVariant);

  async getCart(userId: string) {
    const items = await AppDataSource.query(
      `SELECT ci.id, ci.user_id, ci.variant_id, ci.quantity, ci.created_at, ci.updated_at,
              pv.sku, pv.price, pv.stock_quantity, pv.is_active,
              p.name AS product_name, p.id AS product_id,
              (SELECT url FROM variant_images WHERE variant_id = pv.id AND is_primary = true LIMIT 1) AS image_url
       FROM cart_items ci
       JOIN product_variants pv ON pv.id = ci.variant_id
       JOIN products p ON p.id = pv.product_id
       WHERE ci.user_id = $1
       ORDER BY ci.created_at ASC`,
      [userId],
    );

    const subtotal = items.reduce((sum: number, item: any) =>
      sum + parseFloat(item.price) * item.quantity, 0);

    return { items, subtotal: subtotal.toFixed(2), itemCount: items.length };
  }

  async addItem(userId: string, dto: AddToCartDto) {
    const variant = await this.variantRepo.findOne({ where: { id: dto.variantId, isActive: true } });
    if (!variant) throw new NotFoundError('Product variant');

    if (variant.stockQuantity < dto.quantity) {
      throw new ValidationError(`Only ${variant.stockQuantity} items available`);
    }

    const existing = await this.cartRepo.findOne({ where: { userId, variantId: dto.variantId } });

    if (existing) {
      const newQty = existing.quantity + dto.quantity;
      if (variant.stockQuantity < newQty) {
        throw new ValidationError(`Only ${variant.stockQuantity} items available`);
      }
      existing.quantity = newQty;
      return this.cartRepo.save(existing);
    }

    return this.cartRepo.save(this.cartRepo.create({ userId, variantId: dto.variantId, quantity: dto.quantity }));
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    // Support lookup by cart item id OR variant id
    let item = await this.cartRepo.findOne({ where: { id: itemId, userId } });
    if (!item) {
      item = await this.cartRepo.findOne({ where: { variantId: itemId, userId } });
    }
    if (!item) throw new NotFoundError('Cart item');

    if (dto.quantity === 0) {
      await this.cartRepo.remove(item);
      return null;
    }

    const variant = await this.variantRepo.findOne({ where: { id: item.variantId } });
    if (variant && variant.stockQuantity < dto.quantity) {
      throw new ValidationError(`Only ${variant.stockQuantity} items available`);
    }

    item.quantity = dto.quantity;
    return this.cartRepo.save(item);
  }

  async removeItem(userId: string, itemId: string): Promise<void> {
    let item = await this.cartRepo.findOne({ where: { id: itemId, userId } });
    if (!item) {
      item = await this.cartRepo.findOne({ where: { variantId: itemId, userId } });
    }
    if (!item) throw new NotFoundError('Cart item');
    await this.cartRepo.remove(item);
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartRepo.delete({ userId });
  }
}
