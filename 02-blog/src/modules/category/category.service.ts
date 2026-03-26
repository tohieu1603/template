import { AppDataSource } from '../../config/database.config';
import { Category } from './entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto, CategoryQueryDto } from './dto/category.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { generateSlug } from '../../common/utils/slug.util';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

/**
 * Category service with support for nested tree structure and SEO fields.
 */
export class CategoryService {
  private repo = AppDataSource.getRepository(Category);

  async findAll(query: CategoryQueryDto) {
    const { page = 1, limit = 10, search, status } = query;
    const offset = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('c')
      .orderBy('c.sortOrder', 'ASC')
      .addOrderBy('c.createdAt', 'DESC')
      .limit(limit)
      .offset(offset);

    if (search) {
      qb.where('(c.name ILIKE :s OR c.description ILIKE :s)', { s: `%${search}%` });
    }
    if (status !== undefined) {
      qb.andWhere('c.isActive = :active', { active: status === 'active' });
    }

    const [categories, total] = await qb.getManyAndCount();
    return { categories, meta: buildPaginationMeta(page, limit, total) };
  }

  /**
   * Returns full nested tree structure (all categories with children).
   */
  async findTree(): Promise<Category[]> {
    const all = await this.repo.find({ order: { sortOrder: 'ASC', name: 'ASC' } });
    return this.buildTree(all);
  }

  async findById(id: string): Promise<Category> {
    const category = await this.repo.findOne({ where: { id } });
    if (!category) throw new NotFoundError('Category');

    // Load children
    category.children = await this.repo.find({ where: { parentId: id } });
    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.repo.findOne({ where: { slug } });
    if (!category) throw new NotFoundError('Category');
    category.children = await this.repo.find({ where: { parentId: category.id } });
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const slug = dto.slug ?? generateSlug(dto.name);
    await this.ensureUniqueSlug(slug);

    // Compute level and path
    let level = 0;
    let path = slug;
    if (dto.parentId) {
      const parent = await this.repo.findOne({ where: { id: dto.parentId } });
      if (parent) {
        level = (parent.level ?? 0) + 1;
        path = `${parent.path ?? parent.slug}/${slug}`;
      }
    }

    const category = this.repo.create({ ...dto, slug, level, path });
    return this.repo.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.repo.findOne({ where: { id } });
    if (!category) throw new NotFoundError('Category');

    if (dto.slug && dto.slug !== category.slug) {
      await this.ensureUniqueSlug(dto.slug);
    }

    Object.assign(category, dto);
    return this.repo.save(category);
  }

  async delete(id: string): Promise<void> {
    const category = await this.repo.findOne({ where: { id } });
    if (!category) throw new NotFoundError('Category');

    // Move children to parent's parent
    await this.repo.update({ parentId: id }, { parentId: category.parentId });
    await this.repo.remove(category);
  }

  private buildTree(categories: Category[], parentId: string | null = null): any[] {
    return categories
      .filter((c) => c.parentId === parentId)
      .map((c) => ({
        ...c,
        children: this.buildTree(categories, c.id),
      }));
  }

  private async ensureUniqueSlug(slug: string): Promise<void> {
    const existing = await this.repo.findOne({ where: { slug } });
    if (existing) throw new ConflictError(`Slug '${slug}' already in use`);
  }
}
