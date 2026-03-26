import { AppDataSource } from '../../config/database.config';
import { PageContent } from './entities/page-content.entity';
import { CreatePageContentDto, UpdatePageContentDto, PageContentQueryDto } from './dto/page-content.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class PageContentService {
  private repo = AppDataSource.getRepository(PageContent);

  async findAll(query: PageContentQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const qb = this.repo.createQueryBuilder('p').orderBy('p.slug', 'ASC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('p.title ILIKE :s OR p.slug ILIKE :s', { s: `%${search}%` });
    const [pages, total] = await qb.getManyAndCount();
    return { pages, meta: buildPaginationMeta(page, limit, total) };
  }

  async findBySlug(slug: string) {
    const page = await this.repo.findOne({ where: { slug } });
    if (!page) throw new NotFoundError('Page');
    return page;
  }

  async create(dto: CreatePageContentDto, userId: string) {
    const existing = await this.repo.findOne({ where: { slug: dto.slug } });
    if (existing) throw new ConflictError(`Page slug '${dto.slug}' already exists`);
    return this.repo.save(this.repo.create({ ...dto, updatedBy: userId }));
  }

  async update(slug: string, dto: UpdatePageContentDto, userId: string) {
    const page = await this.findBySlug(slug);
    Object.assign(page, { ...dto, updatedBy: userId });
    return this.repo.save(page);
  }

  async delete(slug: string) {
    const page = await this.findBySlug(slug);
    await this.repo.remove(page);
  }
}
