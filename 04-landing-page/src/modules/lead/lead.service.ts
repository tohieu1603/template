import { AppDataSource } from '../../config/database.config';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto, UpdateLeadDto, LeadQueryDto } from './dto/lead.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class LeadService {
  private repo = AppDataSource.getRepository(Lead);

  async findAll(query: LeadQueryDto) {
    const { page = 1, limit = 20, search, status, source } = query;
    const qb = this.repo.createQueryBuilder('l').orderBy('l.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('(l.email ILIKE :s OR l.name ILIKE :s OR l.company ILIKE :s)', { s: `%${search}%` });
    if (status) qb.andWhere('l.status = :status', { status });
    if (source) qb.andWhere('l.source = :source', { source });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findOne(id: string) {
    const lead = await this.repo.findOne({ where: { id } });
    if (!lead) throw new NotFoundError('Lead');
    return lead;
  }

  async create(dto: CreateLeadDto) {
    const existing = await this.repo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictError('Lead with this email already exists');
    const lead = this.repo.create({ ...dto, lastActivityAt: new Date() });
    return this.repo.save(lead);
  }

  async upsert(dto: CreateLeadDto) {
    const existing = await this.repo.findOne({ where: { email: dto.email } });
    if (existing) {
      existing.lastActivityAt = new Date();
      return this.repo.save(existing);
    }
    return this.create(dto);
  }

  async update(id: string, dto: UpdateLeadDto) {
    const lead = await this.findOne(id);
    Object.assign(lead, { ...dto, lastActivityAt: new Date() });
    return this.repo.save(lead);
  }

  async remove(id: string): Promise<void> {
    const lead = await this.findOne(id);
    await this.repo.remove(lead);
  }
}
