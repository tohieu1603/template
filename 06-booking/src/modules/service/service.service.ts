import { AppDataSource } from '../../config/database.config';
import { Service } from './entities/service.entity';
import { CreateServiceDto, UpdateServiceDto, ServiceQueryDto } from './dto/service.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';
import { generateSlug } from '../../common/utils/slug.util';

export class ServiceService {
  private repo = AppDataSource.getRepository(Service);

  async findAll(query: ServiceQueryDto) {
    const { page = 1, limit = 20, search, categoryId, isActive, isFeatured } = query;
    const qb = this.repo.createQueryBuilder('s')
      .orderBy('s.sortOrder', 'ASC')
      .addOrderBy('s.name', 'ASC')
      .limit(limit)
      .offset((page - 1) * limit);

    if (search) qb.where('s.name ILIKE :s OR s.description ILIKE :s', { s: `%${search}%` });
    if (categoryId) qb.andWhere('s.categoryId = :categoryId', { categoryId });
    if (isActive !== undefined) qb.andWhere('s.isActive = :isActive', { isActive: isActive === 'true' });
    if (isFeatured !== undefined) qb.andWhere('s.isFeatured = :isFeatured', { isFeatured: isFeatured === 'true' });

    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<Service> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundError('Service');
    return item;
  }

  async findBySlug(slug: string): Promise<Service> {
    const item = await this.repo.findOne({ where: { slug } });
    if (!item) throw new NotFoundError('Service');
    return item;
  }

  async create(dto: CreateServiceDto): Promise<Service> {
    const slug = generateSlug(dto.name);
    const existing = await this.repo.findOne({ where: { slug } });
    if (existing) throw new ConflictError(`Service '${dto.name}' already exists`);
    return this.repo.save(this.repo.create({ ...dto, slug }));
  }

  async update(id: string, dto: UpdateServiceDto): Promise<Service> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundError('Service');
    if (dto.name && dto.name !== item.name) {
      const slug = generateSlug(dto.name);
      const existing = await this.repo.findOne({ where: { slug } });
      if (existing && existing.id !== id) throw new ConflictError(`Service '${dto.name}' already exists`);
      (dto as any).slug = slug;
    }
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async delete(id: string): Promise<void> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundError('Service');
    await this.repo.remove(item);
  }
}
