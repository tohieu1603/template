import { AppDataSource } from '../../config/database.config';
import { Wishlist } from './entities/wishlist.entity';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

/**
 * Wishlist service: toggle add/remove product from user's wishlist.
 */
export class WishlistService {
  private repo = AppDataSource.getRepository(Wishlist);

  async findByUser(userId: string, query: PaginationQueryDto) {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const items = await AppDataSource.query(
      `SELECT w.id, w.user_id, w.product_id, w.created_at,
              p.name, p.slug, p.base_price, p.status,
              (SELECT url FROM variant_images vi
               JOIN product_variants pv ON pv.id = vi.variant_id
               WHERE pv.product_id = p.id AND vi.is_primary = true LIMIT 1) AS image_url
       FROM wishlists w
       JOIN products p ON p.id = w.product_id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );

    const count = await this.repo.count({ where: { userId } });
    return { items, meta: buildPaginationMeta(page, limit, count) };
  }

  async toggle(userId: string, productId: string): Promise<{ added: boolean }> {
    const existing = await this.repo.findOne({ where: { userId, productId } });
    if (existing) {
      await this.repo.remove(existing);
      return { added: false };
    }
    await this.repo.save(this.repo.create({ userId, productId }));
    return { added: true };
  }

  async check(userId: string, productId: string): Promise<boolean> {
    const existing = await this.repo.findOne({ where: { userId, productId } });
    return !!existing;
  }
}
