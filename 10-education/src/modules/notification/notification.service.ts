import { AppDataSource } from '../../config/database.config';
import { Notification } from './entities/notification.entity';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class NotificationService {
  private repo = AppDataSource.getRepository(Notification);

  async findAll(userId: string, query: any) {
    const { page = 1, limit = 20, isRead } = query;
    const offset = (page - 1) * limit;
    const qb = this.repo.createQueryBuilder('n')
      .where('n.userId = :userId', { userId })
      .orderBy('n.createdAt', 'DESC')
      .limit(limit).offset(offset);
    if (isRead !== undefined) qb.andWhere('n.isRead = :isRead', { isRead: isRead === 'true' });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async create(dto: any) {
    const notification = this.repo.create(dto);
    return this.repo.save(notification);
  }

  async markRead(id: string, userId: string) {
    const notification = await this.repo.findOne({ where: { id, userId } });
    if (!notification) throw new NotFoundError('Notification');
    notification.isRead = true;
    notification.readAt = new Date();
    return this.repo.save(notification);
  }

  async markAllRead(userId: string) {
    await this.repo.update({ userId, isRead: false }, { isRead: true, readAt: new Date() });
  }

  async delete(id: string, userId: string) {
    const notification = await this.repo.findOne({ where: { id, userId } });
    if (!notification) throw new NotFoundError('Notification');
    await this.repo.remove(notification);
  }
}
