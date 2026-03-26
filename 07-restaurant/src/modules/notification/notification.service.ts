import { AppDataSource } from '../../config/database.config';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto, NotificationQueryDto } from './dto/notification.dto';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class NotificationService {
  private repo = AppDataSource.getRepository(Notification);

  async findAllForUser(userId: string, query: NotificationQueryDto) {
    const { page = 1, limit = 20, type } = query;
    const qb = this.repo.createQueryBuilder('n').where('n.userId = :userId', { userId }).orderBy('n.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (type) qb.andWhere('n.type = :type', { type });
    const [notifications, total] = await qb.getManyAndCount();
    return { notifications, meta: buildPaginationMeta(page, limit, total) };
  }

  async findAll(query: NotificationQueryDto) {
    const { page = 1, limit = 20 } = query;
    const qb = this.repo.createQueryBuilder('n').orderBy('n.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    const [notifications, total] = await qb.getManyAndCount();
    return { notifications, meta: buildPaginationMeta(page, limit, total) };
  }

  async create(dto: CreateNotificationDto): Promise<Notification> {
    return this.repo.save(this.repo.create(dto));
  }

  async markRead(id: string, userId: string): Promise<Notification> {
    const n = await this.repo.findOne({ where: { id, userId } });
    if (!n) throw new NotFoundError('Notification');
    n.isRead = true;
    n.readAt = new Date();
    return this.repo.save(n);
  }

  async markAllRead(userId: string): Promise<void> {
    await this.repo.update({ userId, isRead: false }, { isRead: true, readAt: new Date() });
  }

  async delete(id: string, userId: string): Promise<void> {
    const n = await this.repo.findOne({ where: { id, userId } });
    if (!n) throw new NotFoundError('Notification');
    await this.repo.remove(n);
  }
}
