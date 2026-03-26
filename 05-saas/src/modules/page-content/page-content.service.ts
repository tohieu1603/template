import { AppDataSource } from '../../config/database.config';
import { PageContent } from './entities/page-content.entity';
import { CreatePageContentDto, UpdatePageContentDto, PageContentQueryDto } from './dto/page-content.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class PageContentService {
  private repo = AppDataSource.getRepository(PageContent);

  async findAll(query: PageContentQueryDto) {
    const { page = 1, limit = 10, search, isPublished } = query;
    const qb = this.repo.createQueryBuilder('p').orderBy('p.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('p.title ILIKE :s OR p.slug ILIKE :s', { s: `%${search}%` });
    if (isPublished !== undefined) qb.andWhere('p.isPublished = :pub', { pub: isPublished === 'true' });
    const [pages, total] = await qb.getManyAndCount();
    return { pages, meta: buildPaginationMeta(page, limit, total) };
  }

  async findBySlug(slug: string): Promise<PageContent> {
    const page = await this.repo.findOne({ where: { slug } });
    if (!page) throw new NotFoundError('Page');
    return page;
  }

  async findById(id: string): Promise<PageContent> {
    const page = await this.repo.findOne({ where: { id } });
    if (!page) throw new NotFoundError('Page');
    return page;
  }

  async create(dto: CreatePageContentDto): Promise<PageContent> {
    const existing = await this.repo.findOne({ where: { slug: dto.slug } });
    if (existing) throw new ConflictError(`Slug '${dto.slug}' already exists`);
    const page = this.repo.create(dto);
    if (dto.isPublished) page.publishedAt = new Date();
    return this.repo.save(page);
  }

  async update(id: string, dto: UpdatePageContentDto): Promise<PageContent> {
    const page = await this.findById(id);
    Object.assign(page, dto);
    if (dto.isPublished && !page.publishedAt) page.publishedAt = new Date();
    return this.repo.save(page);
  }

  async delete(id: string): Promise<void> {
    const page = await this.findById(id);
    await this.repo.remove(page);
  }
}
