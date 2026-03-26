import { AppDataSource } from '../../config/database.config';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto, UpdateBrandDto, BrandQueryDto } from './dto/brand.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { generateSlug } from '../../common/utils/slug.util';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class BrandService {
  private repo = AppDataSource.getRepository(Brand);

  async findAll(query: BrandQueryDto) {
    const { page = 1, limit = 10, search, status } = query;

    const qb = this.repo.createQueryBuilder('b').orderBy('b.name', 'ASC').limit(limit).offset((page - 1) * limit);

    if (search) qb.where('b.name ILIKE :s', { s: `%${search}%` });
    if (status !== undefined) qb.andWhere('b.isActive = :active', { active: status === 'active' });

    const [brands, total] = await qb.getManyAndCount();
    return { brands, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<Brand> {
    const brand = await this.repo.findOne({ where: { id } });
    if (!brand) throw new NotFoundError('Brand');
    return brand;
  }

  async create(dto: CreateBrandDto): Promise<Brand> {
    const slug = dto.slug ?? generateSlug(dto.name);
    const existing = await this.repo.findOne({ where: { slug } });
    if (existing) throw new ConflictError(`Slug '${slug}' already in use`);
    return this.repo.save(this.repo.create({ ...dto, slug }));
  }

  async update(id: string, dto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.findById(id);
    Object.assign(brand, dto);
    return this.repo.save(brand);
  }

  async delete(id: string): Promise<void> {
    const brand = await this.findById(id);
    await this.repo.remove(brand);
  }
}
