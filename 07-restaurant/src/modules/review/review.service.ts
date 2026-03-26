import { AppDataSource } from '../../config/database.config';
import { Review } from './entities/review.entity';
import { CreateReviewDto, UpdateReviewDto, AdminReplyDto, ReviewQueryDto } from './dto/review.dto';
import { NotFoundError, ForbiddenError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class ReviewService {
  private repo = AppDataSource.getRepository(Review);

  async findAll(query: ReviewQueryDto) {
    const { page = 1, limit = 10, isVisible, customerId } = query;
    const qb = this.repo.createQueryBuilder('r').orderBy('r.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (isVisible !== undefined) qb.where('r.isVisible = :isVisible', { isVisible });
    if (customerId) qb.andWhere('r.customerId = :customerId', { customerId });
    const [reviews, total] = await qb.getManyAndCount();
    return { reviews, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<Review> {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundError('Review');
    return r;
  }

  async create(dto: CreateReviewDto, customerId: string): Promise<Review> {
    return this.repo.save(this.repo.create({ ...dto, customerId }));
  }

  async update(id: string, dto: UpdateReviewDto, userId: string, isAdmin: boolean): Promise<Review> {
    const review = await this.findById(id);
    if (!isAdmin && review.customerId !== userId) throw new ForbiddenError('Not authorized to update this review');
    Object.assign(review, dto);
    return this.repo.save(review);
  }

  async delete(id: string, userId: string, isAdmin: boolean): Promise<void> {
    const review = await this.findById(id);
    if (!isAdmin && review.customerId !== userId) throw new ForbiddenError('Not authorized to delete this review');
    await this.repo.remove(review);
  }

  async adminReply(id: string, dto: AdminReplyDto): Promise<Review> {
    const review = await this.findById(id);
    review.adminReply = dto.adminReply;
    review.repliedAt = new Date();
    return this.repo.save(review);
  }

  async toggleVisibility(id: string): Promise<Review> {
    const review = await this.findById(id);
    review.isVisible = !review.isVisible;
    return this.repo.save(review);
  }
}
