import { AppDataSource } from '../../config/database.config';
import { MenuCategory } from './entities/menu-category.entity';
import { CreateMenuCategoryDto, UpdateMenuCategoryDto, MenuCategoryQueryDto } from './dto/menu-category.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';
import { generateSlug, generateUniqueSlug } from '../../common/utils/slug.util';

export class MenuCategoryService {
  private repo = AppDataSource.getRepository(MenuCategory);

  async findAll(query: MenuCategoryQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const qb = this.repo.createQueryBuilder('c').orderBy('c.sortOrder', 'ASC').addOrderBy('c.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('c.name ILIKE :s OR c.description ILIKE :s', { s: `%${search}%` });
    if (query.isActive !== undefined) qb.andWhere('c.isActive = :isActive', { isActive: query.isActive });
    const [categories, total] = await qb.getManyAndCount();
    return { categories, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<MenuCategory> {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundError('Menu category');
    return cat;
  }

  async create(dto: CreateMenuCategoryDto): Promise<MenuCategory> {
    let slug = generateSlug(dto.name);
    const existing = await this.repo.findOne({ where: { slug } });
    if (existing) slug = generateUniqueSlug(dto.name, Date.now());
    return this.repo.save(this.repo.create({ ...dto, slug }));
  }

  async update(id: string, dto: UpdateMenuCategoryDto): Promise<MenuCategory> {
    const cat = await this.findById(id);
    if (dto.name && dto.name !== cat.name) {
      let slug = generateSlug(dto.name);
      const existing = await this.repo.findOne({ where: { slug } });
      if (existing && existing.id !== id) slug = generateUniqueSlug(dto.name, Date.now());
      cat.slug = slug;
    }
    Object.assign(cat, dto);
    return this.repo.save(cat);
  }

  async delete(id: string): Promise<void> {
    const cat = await this.findById(id);
    await this.repo.remove(cat);
  }
}
