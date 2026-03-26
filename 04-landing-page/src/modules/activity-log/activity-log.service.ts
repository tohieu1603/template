import { AppDataSource } from '../../config/database.config';
import { ActivityLog } from './entities/activity-log.entity';
import { ActivityLogQueryDto } from './dto/activity-log.dto';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class ActivityLogService {
  private repo = AppDataSource.getRepository(ActivityLog);

  async findAll(query: ActivityLogQueryDto) {
    const { page = 1, limit = 20, search, userId, action, resource } = query;
    const qb = this.repo.createQueryBuilder('a').orderBy('a.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('(a.action ILIKE :s OR a.userEmail ILIKE :s)', { s: `%${search}%` });
    if (userId) qb.andWhere('a.userId = :userId', { userId });
    if (action) qb.andWhere('a.action ILIKE :action', { action: `%${action}%` });
    if (resource) qb.andWhere('a.resource = :resource', { resource });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async log(data: {
    userId?: string;
    userEmail?: string;
    action: string;
    resource?: string;
    resourceId?: string;
    changes?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const log = this.repo.create(data);
    return this.repo.save(log);
  }
}
