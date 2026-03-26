import { AppDataSource } from '../../config/database.config';
import { UsageRecord } from './entities/usage-record.entity';
import { RecordUsageDto, UsageQueryDto } from './dto/usage.dto';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class UsageService {
  private repo = AppDataSource.getRepository(UsageRecord);

  async record(orgId: string, dto: RecordUsageDto): Promise<UsageRecord> {
    const now = new Date();
    const periodStart = dto.periodStart ? new Date(dto.periodStart) : new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = dto.periodEnd ? new Date(dto.periodEnd) : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return this.repo.save(this.repo.create({
      organizationId: orgId,
      featureKey: dto.featureKey,
      quantity: dto.quantity,
      periodStart,
      periodEnd,
      recordedAt: now,
    }));
  }

  async getCurrentPeriod(orgId: string) {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return AppDataSource.query(
      `SELECT feature_key, SUM(quantity) as total_quantity
       FROM usage_records
       WHERE organization_id = $1 AND period_start >= $2 AND period_end <= $3
       GROUP BY feature_key`,
      [orgId, periodStart, periodEnd],
    );
  }

  async getHistory(orgId: string, query: UsageQueryDto) {
    const { page = 1, limit = 10, featureKey } = query;
    const qb = this.repo.createQueryBuilder('u')
      .where('u.organizationId = :orgId', { orgId })
      .orderBy('u.recordedAt', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit);
    if (featureKey) qb.andWhere('u.featureKey = :featureKey', { featureKey });
    const [records, total] = await qb.getManyAndCount();
    return { records, meta: buildPaginationMeta(page, limit, total) };
  }
}
