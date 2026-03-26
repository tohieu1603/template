import { AppDataSource } from '../../config/database.config';
import { Service } from './entities/service.entity';
import { CreateServiceDto, UpdateServiceDto, ServiceQueryDto } from './dto/service.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class ServiceService {
  private repo = AppDataSource.getRepository(Service);

  async findAll(query: ServiceQueryDto) {
    const { page = 1, limit = 10, search, profileId, isActive, isFeatured } = query;
    const qb = this.repo.createQueryBuilder('s').orderBy('s.sortOrder', 'ASC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('(s.title ILIKE :s OR s.shortDescription ILIKE :s)', { s: `%${search}%` });
    if (profileId) qb.andWhere('s.profileId = :profileId', { profileId });
    if (isActive !== undefined) qb.andWhere('s.isActive = :isActive', { isActive: isActive === 'true' });
    if (isFeatured !== undefined) qb.andWhere('s.isFeatured = :isFeatured', { isFeatured: isFeatured === 'true' });
    const [services, total] = await qb.getManyAndCount();
    return { services, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const service = await this.repo.findOne({ where: { id } });
    if (!service) throw new NotFoundError('Service');
    return service;
  }

  async create(dto: CreateServiceDto) {
    const existing = await this.repo.findOne({ where: { slug: dto.slug } });
    if (existing) throw new ConflictError(`Slug '${dto.slug}' already exists`);
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateServiceDto) {
    const service = await this.findById(id);
    Object.assign(service, dto);
    return this.repo.save(service);
  }

  async delete(id: string) {
    const service = await this.findById(id);
    await this.repo.remove(service);
  }
}
