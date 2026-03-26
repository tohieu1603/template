import { AppDataSource } from '../../config/database.config';
import { ActivityLog } from './entities/activity-log.entity';
import { ActivityLogQueryDto } from './dto/activity-log.dto';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class ActivityLogService {
  private repo = AppDataSource.getRepository(ActivityLog);

  async findAll(query: ActivityLogQueryDto) {
    const { page = 1, limit = 10, userId, action, entityType } = query;
    const qb = this.repo.createQueryBuilder('l').orderBy('l.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (userId) qb.where('l.userId = :userId', { userId });
    if (action) qb.andWhere('l.action ILIKE :action', { action: `%${action}%` });
    if (entityType) qb.andWhere('l.entityType = :entityType', { entityType });
    const [logs, total] = await qb.getManyAndCount();
    return { logs, meta: buildPaginationMeta(page, limit, total) };
  }

  async log(data: Partial<ActivityLog>): Promise<ActivityLog> {
    return this.repo.save(this.repo.create(data));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
