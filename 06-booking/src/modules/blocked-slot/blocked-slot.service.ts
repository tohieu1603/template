import { AppDataSource } from '../../config/database.config';
import { BlockedSlot } from '../booking/entities/blocked-slot.entity';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';
import { NotFoundError } from '../../common/errors/app-error';

export class BlockedSlotService {
  private repo = AppDataSource.getRepository(BlockedSlot);

  async findAll(query: any) {
    const { page = 1, limit = 20, providerId, provider_id, dateFrom, date_from, dateTo, date_to } = query;
    const resolvedProviderId = providerId ?? provider_id;
    const resolvedDateFrom = dateFrom ?? date_from;
    const resolvedDateTo = dateTo ?? date_to;
    const qb = this.repo.createQueryBuilder('bs').orderBy('bs.blockedDate', 'ASC').limit(limit).offset((page - 1) * limit);
    if (resolvedProviderId) qb.where('bs.providerId = :providerId', { providerId: resolvedProviderId });
    if (resolvedDateFrom) qb.andWhere('bs.blockedDate >= :dateFrom', { dateFrom: resolvedDateFrom });
    if (resolvedDateTo) qb.andWhere('bs.blockedDate <= :dateTo', { dateTo: resolvedDateTo });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<BlockedSlot> {
    const slot = await this.repo.findOne({ where: { id } });
    if (!slot) throw new NotFoundError('Blocked slot');
    return slot;
  }

  async create(dto: any, createdBy: string): Promise<any> {
    const slot = this.repo.create({
      providerId: dto.provider_id ?? dto.providerId,
      blockedDate: dto.date ?? dto.blocked_date ?? dto.blockedDate,
      startTime: dto.start_time ?? dto.startTime,
      endTime: dto.end_time ?? dto.endTime,
      reason: dto.reason,
      createdBy,
    });
    return this.repo.save(slot);
  }

  async delete(id: string): Promise<void> {
    const slot = await this.repo.findOne({ where: { id } });
    if (!slot) throw new NotFoundError('Blocked slot');
    await this.repo.remove(slot);
  }
}
