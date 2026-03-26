import { AppDataSource } from '../../config/database.config';
import { ProjectCategory } from './entities/project-category.entity';
import { CreateProjectCategoryDto, UpdateProjectCategoryDto, ProjectCategoryQueryDto } from './dto/project-category.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class ProjectCategoryService {
  private repo = AppDataSource.getRepository(ProjectCategory);

  async findAll(query: ProjectCategoryQueryDto) {
    const { page = 1, limit = 20, search, isActive } = query;
    const qb = this.repo.createQueryBuilder('c').orderBy('c.sortOrder', 'ASC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('c.name ILIKE :s', { s: `%${search}%` });
    if (isActive !== undefined) qb.andWhere('c.isActive = :isActive', { isActive: isActive === 'true' });
    const [categories, total] = await qb.getManyAndCount();
    return { categories, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundError('Project category');
    return cat;
  }

  async create(dto: CreateProjectCategoryDto) {
    const existing = await this.repo.findOne({ where: { slug: dto.slug } });
    if (existing) throw new ConflictError(`Slug '${dto.slug}' already exists`);
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateProjectCategoryDto) {
    const cat = await this.findById(id);
    Object.assign(cat, dto);
    return this.repo.save(cat);
  }

  async delete(id: string) {
    const cat = await this.findById(id);
    await this.repo.remove(cat);
  }
}
