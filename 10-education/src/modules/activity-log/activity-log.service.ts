import { AppDataSource } from '../../config/database.config';
import { ActivityLog } from './entities/activity-log.entity';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class ActivityLogService {
  private repo = AppDataSource.getRepository(ActivityLog);

  async findAll(query: any) {
    const { page = 1, limit = 20, userId, action, entityType } = query;
    const offset = (page - 1) * limit;
    const qb = this.repo.createQueryBuilder('a').orderBy('a.createdAt', 'DESC').limit(limit).offset(offset);
    if (userId) qb.where('a.userId = :userId', { userId });
    if (action) qb.andWhere('a.action ILIKE :action', { action: `%${action}%` });
    if (entityType) qb.andWhere('a.entityType = :entityType', { entityType });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async log(userId: string | null, action: string, entityType?: string, entityId?: string, metadata?: any, ipAddress?: string) {
    const log = this.repo.create({ userId: userId ?? undefined, action, entityType, entityId, metadata, ipAddress });
    return this.repo.save(log);
  }
}
