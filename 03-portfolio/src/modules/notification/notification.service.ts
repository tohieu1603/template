import { AppDataSource } from '../../config/database.config';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto, NotificationQueryDto } from './dto/notification.dto';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class NotificationService {
  private repo = AppDataSource.getRepository(Notification);

  async findAll(query: NotificationQueryDto, userId?: string) {
    const { page = 1, limit = 20, isRead } = query;
    const qb = this.repo.createQueryBuilder('n').orderBy('n.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (userId) qb.where('(n.userId = :userId OR n.userId IS NULL)', { userId });
    if (isRead !== undefined) qb.andWhere('n.isRead = :isRead', { isRead: isRead === 'true' });
    const [notifications, total] = await qb.getManyAndCount();
    return { notifications, meta: buildPaginationMeta(page, limit, total) };
  }

  async create(dto: CreateNotificationDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async markRead(id: string) {
    const notification = await this.repo.findOne({ where: { id } });
    if (!notification) throw new NotFoundError('Notification');
    notification.isRead = true;
    notification.readAt = new Date();
    return this.repo.save(notification);
  }

  async markAllRead(userId: string) {
    await this.repo.update({ userId, isRead: false }, { isRead: true, readAt: new Date() });
  }

  async delete(id: string) {
    const notification = await this.repo.findOne({ where: { id } });
    if (!notification) throw new NotFoundError('Notification');
    await this.repo.remove(notification);
  }
}
