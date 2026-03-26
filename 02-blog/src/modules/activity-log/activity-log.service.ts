import { AppDataSource } from '../../config/database.config';
import { ActivityLog } from './entities/activity-log.entity';
import { buildPaginationMeta, PaginationQueryDto } from '../../common/dto/pagination.dto';

/**
 * Activity log service: records and retrieves user/admin actions.
 */
export class ActivityLogService {
  private repo = AppDataSource.getRepository(ActivityLog);

  async findAll(query: PaginationQueryDto & { userId?: string; action?: string; entityType?: string }) {
    const { page = 1, limit = 20, search, userId, action, entityType } = query;

    const qb = this.repo.createQueryBuilder('a').orderBy('a.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (userId) qb.where('a.userId = :userId', { userId });
    if (action) qb.andWhere('a.action = :action', { action });
    if (entityType) qb.andWhere('a.entityType = :entityType', { entityType });
    if (search) qb.andWhere('(a.entityName ILIKE :s OR a.action ILIKE :s)', { s: `%${search}%` });

    const [logs, total] = await qb.getManyAndCount();
    return { logs, meta: buildPaginationMeta(page, limit, total) };
  }

  async log(params: {
    userId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    entityName?: string;
    metadata?: any;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<ActivityLog> {
    return this.repo.save(this.repo.create(params));
  }
}
