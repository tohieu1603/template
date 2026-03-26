import { AppDataSource } from '../../config/database.config';
import { ActivityLog } from './entities/activity-log.entity';
import { ActivityLogQueryDto } from './dto/activity-log.dto';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class ActivityLogService {
  private repo = AppDataSource.getRepository(ActivityLog);

  async findAll(query: ActivityLogQueryDto) {
    const { page = 1, limit = 20, action, entityType, userId } = query;
    const qb = this.repo.createQueryBuilder('l').orderBy('l.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (action) qb.where('l.action = :action', { action });
    if (entityType) qb.andWhere('l.entityType = :entityType', { entityType });
    if (userId) qb.andWhere('l.userId = :userId', { userId });
    const [logs, total] = await qb.getManyAndCount();
    return { logs, meta: buildPaginationMeta(page, limit, total) };
  }

  async log(data: { userId?: string; action: string; entityType?: string; entityId?: string; changes?: any; ipAddress?: string; userAgent?: string }) {
    await this.repo.save(this.repo.create(data));
  }
}
