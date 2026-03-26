import { AppDataSource } from '../../config/database.config';
import { Notification } from './entities/notification.entity';
import { NotFoundError, ForbiddenError } from '../../common/errors/app-error';
import { buildPaginationMeta, PaginationQueryDto } from '../../common/dto/pagination.dto';

export class NotificationService {
  private repo = AppDataSource.getRepository(Notification);

  async findByUser(userId: string, query: PaginationQueryDto) {
    const { page = 1, limit = 20 } = query;

    const qb = this.repo.createQueryBuilder('n')
      .where('n.userId = :userId', { userId })
      .orderBy('n.createdAt', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit);

    const [notifications, total] = await qb.getManyAndCount();
    const unreadCount = await this.repo.count({ where: { userId, isRead: false } });
    return { notifications, unreadCount, meta: buildPaginationMeta(page, limit, total) };
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.repo.findOne({ where: { id } });
    if (!notification) throw new NotFoundError('Notification');
    if (notification.userId !== userId) throw new ForbiddenError('Access denied');

    notification.isRead = true;
    notification.readAt = new Date();
    return this.repo.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repo.update({ userId, isRead: false }, { isRead: true, readAt: new Date() });
  }

  async delete(id: string, userId: string): Promise<void> {
    const notification = await this.repo.findOne({ where: { id, userId } });
    if (!notification) throw new NotFoundError('Notification');
    await this.repo.remove(notification);
  }

  async create(userId: string, type: string, title: string, content: string, data?: any): Promise<Notification> {
    return this.repo.save(this.repo.create({ userId, type, title, content, data }));
  }
}
