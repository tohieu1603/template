import { AppDataSource } from '../../config/database.config';
import { ActivityLog } from './entities/activity-log.entity';
import { ActivityLogQueryDto } from './dto/activity-log.dto';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class ActivityLogService {
  private repo = AppDataSource.getRepository(ActivityLog);

  async findAll(query: ActivityLogQueryDto) {
    const { page = 1, limit = 20, action, entityType, userId } = query;
    const qb = this.repo.createQueryBuilder('a').orderBy('a.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (action) qb.where('a.action ILIKE :action', { action: `%${action}%` });
    if (entityType) qb.andWhere('a.entityType = :entityType', { entityType });
    if (userId) qb.andWhere('a.userId = :userId', { userId });
    const [logs, total] = await qb.getManyAndCount();
    return { logs, meta: buildPaginationMeta(page, limit, total) };
  }

  async log(data: { userId?: string; action: string; entityType?: string; entityId?: string; entityName?: string; metadata?: any; changes?: any; ipAddress?: string; userAgent?: string }): Promise<ActivityLog> {
    return this.repo.save(this.repo.create(data));
  }
}
