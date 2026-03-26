import { AppDataSource } from '../../config/database.config';
import { Newsletter } from './entities/newsletter.entity';
import { SubscribeNewsletterDto, UnsubscribeNewsletterDto, NewsletterQueryDto } from './dto/newsletter.dto';
import { NotFoundError, ConflictError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class NewsletterService {
  private repo = AppDataSource.getRepository(Newsletter);

  async findAll(query: NewsletterQueryDto) {
    const { page = 1, limit = 20, search, isSubscribed } = query;
    const qb = this.repo.createQueryBuilder('n').orderBy('n.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('n.email ILIKE :s OR n.name ILIKE :s', { s: `%${search}%` });
    if (isSubscribed !== undefined) qb.andWhere('n.isSubscribed = :isSubscribed', { isSubscribed: isSubscribed === 'true' });

    const [subscribers, total] = await qb.getManyAndCount();
    return { subscribers, meta: buildPaginationMeta(page, limit, total) };
  }

  async subscribe(dto: SubscribeNewsletterDto): Promise<Newsletter> {
    const existing = await this.repo.findOne({ where: { email: dto.email } });
    if (existing) {
      if (existing.isSubscribed) throw new ConflictError('Email already subscribed');
      existing.isSubscribed = true;
      existing.subscribedAt = new Date();
      existing.unsubscribedAt = null as any;
      if (dto.name) existing.name = dto.name;
      return this.repo.save(existing);
    }
    return this.repo.save(this.repo.create(dto));
  }

  async unsubscribe(dto: UnsubscribeNewsletterDto): Promise<void> {
    const subscriber = await this.repo.findOne({ where: { email: dto.email } });
    if (!subscriber) throw new NotFoundError('Subscriber');
    subscriber.isSubscribed = false;
    subscriber.unsubscribedAt = new Date();
    await this.repo.save(subscriber);
  }

  async delete(id: string): Promise<void> {
    const subscriber = await this.repo.findOne({ where: { id } });
    if (!subscriber) throw new NotFoundError('Subscriber');
    await this.repo.remove(subscriber);
  }
}
