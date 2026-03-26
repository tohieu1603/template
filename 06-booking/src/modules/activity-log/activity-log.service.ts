import { AppDataSource } from '../../config/database.config';
import { ActivityLog } from './entities/activity-log.entity';
import { ActivityLogQueryDto } from './dto/activity-log.dto';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class ActivityLogService {
  private repo = AppDataSource.getRepository(ActivityLog);

  async findAll(query: ActivityLogQueryDto) {
    const { page = 1, limit = 20, userId, action, entityType } = query;
    const qb = this.repo.createQueryBuilder('al').orderBy('al.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (userId) qb.where('al.userId = :userId', { userId });
    if (action) qb.andWhere('al.action ILIKE :action', { action: `%${action}%` });
    if (entityType) qb.andWhere('al.entityType = :entityType', { entityType });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async log(data: Partial<ActivityLog>): Promise<ActivityLog> {
    return this.repo.save(this.repo.create(data));
  }
}
