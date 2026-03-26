import { AppDataSource } from '../../config/database.config';
import { PageContent } from './entities/page-content.entity';
import { CreatePageContentDto, UpdatePageContentDto, PageContentQueryDto } from './dto/page-content.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class PageContentService {
  private repo = AppDataSource.getRepository(PageContent);

  async findAll(query: PageContentQueryDto) {
    const { page = 1, limit = 20, search } = query;
    const qb = this.repo.createQueryBuilder('p').orderBy('p.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('p.pageName ILIKE :s OR p.pageSlug ILIKE :s', { s: `%${search}%` });

    const [pages, total] = await qb.getManyAndCount();
    return { pages, meta: buildPaginationMeta(page, limit, total) };
  }

  async findBySlug(slug: string): Promise<PageContent> {
    const page = await this.repo.findOne({ where: { pageSlug: slug, isActive: true } });
    if (!page) throw new NotFoundError('Page');
    return page;
  }

  async findById(id: string): Promise<PageContent> {
    const page = await this.repo.findOne({ where: { id } });
    if (!page) throw new NotFoundError('Page');
    return page;
  }

  async create(dto: CreatePageContentDto): Promise<PageContent> {
    const existing = await this.repo.findOne({ where: { pageSlug: dto.pageSlug } });
    if (existing) throw new ConflictError(`Page slug '${dto.pageSlug}' already exists`);
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdatePageContentDto): Promise<PageContent> {
    const page = await this.findById(id);
    Object.assign(page, dto);
    return this.repo.save(page);
  }

  async delete(id: string): Promise<void> {
    const page = await this.findById(id);
    await this.repo.remove(page);
  }
}
