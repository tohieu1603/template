import { AppDataSource } from '../../config/database.config';
import { ServiceCategory } from './entities/service-category.entity';
import { CreateServiceCategoryDto, UpdateServiceCategoryDto, ServiceCategoryQueryDto } from './dto/service-category.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';
import { generateSlug } from '../../common/utils/slug.util';

export class ServiceCategoryService {
  private repo = AppDataSource.getRepository(ServiceCategory);

  async findAll(query: ServiceCategoryQueryDto) {
    const { page = 1, limit = 20, search, isActive } = query;
    const qb = this.repo.createQueryBuilder('sc').orderBy('sc.sortOrder').addOrderBy('sc.name').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('sc.name ILIKE :s OR sc.description ILIKE :s', { s: `%${search}%` });
    if (isActive !== undefined) qb.andWhere('sc.isActive = :isActive', { isActive: isActive === 'true' });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<ServiceCategory> {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundError('Service category');
    return cat;
  }

  async findBySlug(slug: string): Promise<ServiceCategory> {
    const cat = await this.repo.findOne({ where: { slug } });
    if (!cat) throw new NotFoundError('Service category');
    return cat;
  }

  async create(dto: CreateServiceCategoryDto): Promise<ServiceCategory> {
    const slug = generateSlug(dto.name);
    const existing = await this.repo.findOne({ where: { slug } });
    if (existing) throw new ConflictError(`Category '${dto.name}' already exists`);
    return this.repo.save(this.repo.create({ ...dto, slug }));
  }

  async update(id: string, dto: UpdateServiceCategoryDto): Promise<ServiceCategory> {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundError('Service category');
    if (dto.name && dto.name !== cat.name) {
      cat.slug = generateSlug(dto.name);
    }
    Object.assign(cat, dto);
    return this.repo.save(cat);
  }

  async delete(id: string): Promise<void> {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundError('Service category');
    await this.repo.remove(cat);
  }
}
