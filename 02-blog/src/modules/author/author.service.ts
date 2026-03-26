import { AppDataSource } from '../../config/database.config';
import { Author } from './entities/author.entity';
import { CreateAuthorDto, UpdateAuthorDto, AuthorQueryDto } from './dto/author.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { generateSlug } from '../../common/utils/slug.util';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

/**
 * Author service: E-E-A-T author profile management.
 */
export class AuthorService {
  private repo = AppDataSource.getRepository(Author);

  async findAll(query: AuthorQueryDto) {
    const { page = 1, limit = 10, search, status, featured } = query;
    const offset = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('a')
      .orderBy('a.sortOrder', 'ASC')
      .addOrderBy('a.createdAt', 'DESC')
      .limit(limit)
      .offset(offset);

    if (search) {
      qb.where('(a.name ILIKE :s OR a.bio ILIKE :s OR a.jobTitle ILIKE :s)', { s: `%${search}%` });
    }
    if (status !== undefined) {
      qb.andWhere('a.isActive = :active', { active: status === 'active' });
    }
    if (featured === 'true') {
      qb.andWhere('a.isFeatured = true');
    }

    const [authors, total] = await qb.getManyAndCount();
    return { authors, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<Author> {
    const author = await this.repo.findOne({ where: { id } });
    if (!author) throw new NotFoundError('Author');
    return author;
  }

  async findBySlug(slug: string): Promise<Author> {
    const author = await this.repo.findOne({ where: { slug } });
    if (!author) throw new NotFoundError('Author');
    return author;
  }

  async create(dto: CreateAuthorDto): Promise<Author> {
    const slug = dto.slug ?? generateSlug(dto.name);
    await this.ensureUniqueSlug(slug);

    const author = this.repo.create({ ...dto, slug });
    return this.repo.save(author);
  }

  async update(id: string, dto: UpdateAuthorDto): Promise<Author> {
    const author = await this.repo.findOne({ where: { id } });
    if (!author) throw new NotFoundError('Author');

    if (dto.slug && dto.slug !== author.slug) {
      await this.ensureUniqueSlug(dto.slug);
    }

    Object.assign(author, dto);
    return this.repo.save(author);
  }

  async delete(id: string): Promise<void> {
    const author = await this.repo.findOne({ where: { id } });
    if (!author) throw new NotFoundError('Author');
    await this.repo.remove(author);
  }

  private async ensureUniqueSlug(slug: string): Promise<void> {
    const existing = await this.repo.findOne({ where: { slug } });
    if (existing) throw new ConflictError(`Slug '${slug}' already in use`);
  }
}
