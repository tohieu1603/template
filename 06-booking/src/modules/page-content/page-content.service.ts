import { AppDataSource } from '../../config/database.config';
import { PageContent } from './entities/page-content.entity';
import { CreatePageContentDto, UpdatePageContentDto, PageContentQueryDto } from './dto/page-content.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class PageContentService {
  private repo = AppDataSource.getRepository(PageContent);

  async findAll(query: PageContentQueryDto) {
    const { page = 1, limit = 20, search } = query;
    const qb = this.repo.createQueryBuilder('p').orderBy('p.slug').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('p.title ILIKE :s OR p.slug ILIKE :s', { s: `%${search}%` });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
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
    if (existing) throw new ConflictError(`Page '${dto.slug}' already exists`);
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdatePageContentDto): Promise<PageContent> {
    const page = await this.repo.findOne({ where: { id } });
    if (!page) throw new NotFoundError('Page');
    Object.assign(page, dto);
    return this.repo.save(page);
  }

  async delete(id: string): Promise<void> {
    const page = await this.repo.findOne({ where: { id } });
    if (!page) throw new NotFoundError('Page');
    await this.repo.remove(page);
  }
}
