import { AppDataSource } from '../../config/database.config';
import { Provider } from './entities/provider.entity';
import { WorkingHours } from './entities/working-hours.entity';
import { ProviderBreak } from './entities/provider-break.entity';
import { BlockedSlot } from '../booking/entities/blocked-slot.entity';
import {
  CreateProviderDto, UpdateProviderDto, ProviderQueryDto,
  CreateWorkingHoursDto, CreateProviderBreakDto, CreateBlockedSlotDto,
} from './dto/provider.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';
import { generateSlug } from '../../common/utils/slug.util';

export class ProviderService {
  private providerRepo = AppDataSource.getRepository(Provider);
  private whRepo = AppDataSource.getRepository(WorkingHours);
  private breakRepo = AppDataSource.getRepository(ProviderBreak);
  private blockedRepo = AppDataSource.getRepository(BlockedSlot);

  async findAll(query: ProviderQueryDto) {
    const { page = 1, limit = 20, search, isActive } = query;
    const qb = this.providerRepo.createQueryBuilder('p')
      .orderBy('p.sortOrder', 'ASC')
      .addOrderBy('p.name', 'ASC')
      .limit(limit)
      .offset((page - 1) * limit);

    if (search) qb.where('p.name ILIKE :s OR p.title ILIKE :s', { s: `%${search}%` });
    if (isActive !== undefined) qb.andWhere('p.isActive = :isActive', { isActive: isActive === 'true' });

    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<Provider> {
    const item = await this.providerRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundError('Provider');
    return item;
  }

  async create(dto: CreateProviderDto): Promise<Provider> {
    const slug = generateSlug(dto.name);
    const existing = await this.providerRepo.findOne({ where: { slug } });
    if (existing) throw new ConflictError(`Provider '${dto.name}' already exists`);
    return this.providerRepo.save(this.providerRepo.create({ ...dto, slug }));
  }

  async update(id: string, dto: UpdateProviderDto): Promise<Provider> {
    const item = await this.providerRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundError('Provider');
    if (dto.name && dto.name !== item.name) {
      const slug = generateSlug(dto.name);
      const existing = await this.providerRepo.findOne({ where: { slug } });
      if (existing && existing.id !== id) throw new ConflictError(`Provider '${dto.name}' already exists`);
      (dto as any).slug = slug;
    }
    Object.assign(item, dto);
    return this.providerRepo.save(item);
  }

  async delete(id: string): Promise<void> {
    const item = await this.providerRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundError('Provider');
    await this.providerRepo.remove(item);
  }

  // Working hours
  async getWorkingHours(providerId: string): Promise<WorkingHours[]> {
    return this.whRepo.find({ where: { providerId }, order: { dayOfWeek: 'ASC' } });
  }

  async setWorkingHours(providerId: string, dto: CreateWorkingHoursDto): Promise<WorkingHours> {
    const existing = await this.whRepo.findOne({ where: { providerId, dayOfWeek: dto.dayOfWeek } });
    if (existing) {
      Object.assign(existing, dto);
      return this.whRepo.save(existing);
    }
    return this.whRepo.save(this.whRepo.create({ providerId, ...dto }));
  }

  async deleteWorkingHours(id: string): Promise<void> {
    const item = await this.whRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundError('Working hours');
    await this.whRepo.remove(item);
  }

  // Breaks
  async getBreaks(providerId: string): Promise<ProviderBreak[]> {
    return this.breakRepo.find({ where: { providerId }, order: { dayOfWeek: 'ASC' } });
  }

  async addBreak(providerId: string, dto: CreateProviderBreakDto): Promise<ProviderBreak> {
    return this.breakRepo.save(this.breakRepo.create({ providerId, ...dto }));
  }

  async deleteBreak(id: string): Promise<void> {
    const item = await this.breakRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundError('Provider break');
    await this.breakRepo.remove(item);
  }

  // Blocked slots
  async getBlockedSlots(providerId: string): Promise<BlockedSlot[]> {
    return this.blockedRepo.find({ where: { providerId }, order: { blockedDate: 'ASC' } });
  }

  async addBlockedSlot(providerId: string, dto: CreateBlockedSlotDto, createdBy: string): Promise<BlockedSlot> {
    return this.blockedRepo.save(this.blockedRepo.create({ providerId, ...dto, createdBy }));
  }

  async deleteBlockedSlot(id: string): Promise<void> {
    const item = await this.blockedRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundError('Blocked slot');
    await this.blockedRepo.remove(item);
  }
}
