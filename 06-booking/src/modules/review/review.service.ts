import { AppDataSource } from '../../config/database.config';
import { Review } from './entities/review.entity';
import { Booking } from '../booking/entities/booking.entity';
import { CreateReviewDto, UpdateReviewDto, ReplyReviewDto, ReviewQueryDto } from './dto/review.dto';
import { NotFoundError, ConflictError, ForbiddenError, UnprocessableError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class ReviewService {
  private repo = AppDataSource.getRepository(Review);
  private bookingRepo = AppDataSource.getRepository(Booking);

  async findAll(query: ReviewQueryDto) {
    const { page = 1, limit = 20, providerId, serviceId, rating, isVisible } = query;
    const qb = this.repo.createQueryBuilder('r')
      .orderBy('r.createdAt', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit);

    if (providerId) qb.where('r.providerId = :providerId', { providerId });
    if (serviceId) qb.andWhere('r.serviceId = :serviceId', { serviceId });
    if (rating) qb.andWhere('r.rating = :rating', { rating: parseInt(rating, 10) });
    if (isVisible !== undefined) qb.andWhere('r.isVisible = :isVisible', { isVisible: isVisible === 'true' });

    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<Review> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundError('Review');
    return item;
  }

  async create(dto: CreateReviewDto, customerId: string): Promise<Review> {
    // Check booking exists and belongs to customer
    const booking = await this.bookingRepo.findOne({ where: { id: dto.bookingId } });
    if (!booking) throw new NotFoundError('Booking');
    if (booking.customerId !== customerId) throw new ForbiddenError('Not your booking');
    if (booking.status !== 'completed') throw new UnprocessableError('Can only review completed bookings');

    // Check if already reviewed
    const existing = await this.repo.findOne({ where: { bookingId: dto.bookingId } });
    if (existing) throw new ConflictError('Already reviewed this booking');

    return this.repo.save(this.repo.create({
      ...dto,
      customerId,
      providerId: booking.providerId,
      serviceId: booking.serviceId,
    }));
  }

  async update(id: string, dto: UpdateReviewDto, userId: string): Promise<Review> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundError('Review');
    if (item.customerId !== userId) throw new ForbiddenError('Not your review');
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async reply(id: string, dto: ReplyReviewDto): Promise<Review> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundError('Review');
    item.adminReply = dto.adminReply;
    item.repliedAt = new Date();
    return this.repo.save(item);
  }

  async delete(id: string): Promise<void> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundError('Review');
    await this.repo.remove(item);
  }
}
