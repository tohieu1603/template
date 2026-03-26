import { AppDataSource } from '../../config/database.config';
import { CourseCategory } from './entities/course-category.entity';
import { CreateCourseCategoryDto, UpdateCourseCategoryDto, CourseCategoryQueryDto } from './dto/course-category.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';
import { generateSlug } from '../../common/utils/slug.util';

export class CourseCategoryService {
  private repo = AppDataSource.getRepository(CourseCategory);

  async findAll(query: CourseCategoryQueryDto) {
    const { page = 1, limit = 50, search, parentId } = query;
    const offset = (page - 1) * limit;
    const qb = this.repo.createQueryBuilder('c')
      .leftJoinAndSelect('c.children', 'children')
      .orderBy('c.sortOrder', 'ASC')
      .addOrderBy('c.name', 'ASC')
      .limit(limit).offset(offset);
    if (search) qb.where('c.name ILIKE :s', { s: `%${search}%` });
    if (parentId === 'null' || parentId === '') {
      qb.andWhere('c.parentId IS NULL');
    } else if (parentId) {
      qb.andWhere('c.parentId = :parentId', { parentId });
    }
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findTree() {
    const all = await this.repo.find({ relations: ['children', 'children.children'], order: { sortOrder: 'ASC', name: 'ASC' } });
    return all.filter((c) => !c.parentId);
  }

  async findById(id: string) {
    const cat = await this.repo.findOne({ where: { id }, relations: ['parent', 'children'] });
    if (!cat) throw new NotFoundError('Category');
    return cat;
  }

  async findBySlug(slug: string) {
    const cat = await this.repo.findOne({ where: { slug }, relations: ['parent', 'children'] });
    if (!cat) throw new NotFoundError('Category');
    return cat;
  }

  async create(dto: CreateCourseCategoryDto) {
    const slug = generateSlug(dto.name);
    const existing = await this.repo.findOne({ where: { slug } });
    if (existing) throw new ConflictError('Category slug already exists');
    const cat = this.repo.create({ ...dto, slug });
    return this.repo.save(cat);
  }

  async update(id: string, dto: UpdateCourseCategoryDto) {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundError('Category');
    if (dto.name) cat.slug = generateSlug(dto.name);
    Object.assign(cat, dto);
    return this.repo.save(cat);
  }

  async delete(id: string) {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundError('Category');
    await this.repo.remove(cat);
  }
}
