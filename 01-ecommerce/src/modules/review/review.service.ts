import { AppDataSource } from '../../config/database.config';
import { Review } from './entities/review.entity';
import { ReviewImage } from './entities/review-image.entity';
import { CreateReviewDto, UpdateReviewDto, AdminReviewDto, ReviewQueryDto } from './dto/review.dto';
import { NotFoundError, ForbiddenError, ConflictError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class ReviewService {
  private reviewRepo = AppDataSource.getRepository(Review);
  private imageRepo = AppDataSource.getRepository(ReviewImage);

  async findAll(query: ReviewQueryDto) {
    const { page = 1, limit = 10, productId, userId, rating, visible } = query;

    const qb = this.reviewRepo.createQueryBuilder('r').orderBy('r.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);

    if (productId) qb.where('r.productId = :productId', { productId });
    if (userId) qb.andWhere('r.userId = :userId', { userId });
    if (rating) qb.andWhere('r.rating = :rating', { rating: parseInt(rating) });
    if (visible !== undefined) qb.andWhere('r.isVisible = :v', { v: visible === 'true' });

    const [reviews, total] = await qb.getManyAndCount();
    const enriched = await Promise.all(reviews.map((r) => this.enrichReview(r)));
    return { reviews: enriched, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundError('Review');
    return this.enrichReview(review);
  }

  async create(userId: string, dto: CreateReviewDto, imageUrls: string[] = []) {
    const existing = await this.reviewRepo.findOne({
      where: { userId, productId: dto.productId, orderItemId: dto.orderItemId },
    });
    if (existing) throw new ConflictError('You already reviewed this product');

    const review = await this.reviewRepo.save(this.reviewRepo.create({ ...dto, userId }));

    if (imageUrls.length) {
      const images = imageUrls.map((url, i) => this.imageRepo.create({ reviewId: review.id, url, sortOrder: i }));
      await this.imageRepo.save(images);
    }

    return this.enrichReview(review);
  }

  async update(id: string, userId: string, dto: UpdateReviewDto): Promise<Review> {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundError('Review');
    if (review.userId !== userId) throw new ForbiddenError('Access denied');

    Object.assign(review, dto);
    return this.reviewRepo.save(review);
  }

  async adminUpdate(id: string, dto: AdminReviewDto): Promise<Review> {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundError('Review');

    Object.assign(review, dto);
    if (dto.adminReply) review.repliedAt = new Date();
    return this.reviewRepo.save(review);
  }

  async delete(id: string, userId: string, isAdmin = false): Promise<void> {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundError('Review');
    if (!isAdmin && review.userId !== userId) throw new ForbiddenError('Access denied');
    await this.reviewRepo.remove(review);
  }

  async getProductStats(productId: string) {
    const result = await AppDataSource.query(
      `SELECT AVG(rating)::NUMERIC(3,2) AS average_rating,
              COUNT(*) AS total_reviews,
              COUNT(CASE WHEN rating = 5 THEN 1 END) AS five_star,
              COUNT(CASE WHEN rating = 4 THEN 1 END) AS four_star,
              COUNT(CASE WHEN rating = 3 THEN 1 END) AS three_star,
              COUNT(CASE WHEN rating = 2 THEN 1 END) AS two_star,
              COUNT(CASE WHEN rating = 1 THEN 1 END) AS one_star
       FROM reviews WHERE product_id = $1 AND is_visible = true`,
      [productId],
    );
    return result[0];
  }

  private async enrichReview(review: Review) {
    const images = await this.imageRepo.find({ where: { reviewId: review.id }, order: { sortOrder: 'ASC' } });
    const user = await AppDataSource.query(
      'SELECT id, full_name, avatar_url FROM users WHERE id = $1',
      [review.userId],
    );
    return { ...review, images, user: user[0] ?? null };
  }
}
