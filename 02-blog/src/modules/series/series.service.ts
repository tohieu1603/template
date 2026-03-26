import { AppDataSource } from '../../config/database.config';
import { Series } from './entities/series.entity';
import { CreateSeriesDto, UpdateSeriesDto, SeriesQueryDto } from './dto/series.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { generateSlug } from '../../common/utils/slug.util';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class SeriesService {
  private repo = AppDataSource.getRepository(Series);

  async findAll(query: SeriesQueryDto) {
    const { page = 1, limit = 10, search, status, authorId } = query;
    const offset = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('s')
      .orderBy('s.createdAt', 'DESC')
      .limit(limit)
      .offset(offset);

    if (search) {
      qb.where('(s.title ILIKE :s OR s.description ILIKE :s)', { s: `%${search}%` });
    }
    if (status) qb.andWhere('s.status = :status', { status });
    if (authorId) qb.andWhere('s.authorId = :authorId', { authorId });

    const [seriesList, total] = await qb.getManyAndCount();
    return { series: seriesList, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<Series> {
    const series = await this.repo.findOne({ where: { id } });
    if (!series) throw new NotFoundError('Series');
    return series;
  }

  async findBySlug(slug: string): Promise<Series> {
    const series = await this.repo.findOne({ where: { slug } });
    if (!series) throw new NotFoundError('Series');
    return series;
  }

  async create(dto: CreateSeriesDto): Promise<Series> {
    const slug = dto.slug ?? generateSlug(dto.title);
    const existing = await this.repo.findOne({ where: { slug } });
    if (existing) throw new ConflictError(`Slug '${slug}' already in use`);

    const series = this.repo.create({ ...dto, slug });
    return this.repo.save(series);
  }

  async update(id: string, dto: UpdateSeriesDto): Promise<Series> {
    const series = await this.repo.findOne({ where: { id } });
    if (!series) throw new NotFoundError('Series');

    if (dto.slug && dto.slug !== series.slug) {
      const existing = await this.repo.findOne({ where: { slug: dto.slug } });
      if (existing) throw new ConflictError(`Slug '${dto.slug}' already in use`);
    }

    Object.assign(series, dto);
    return this.repo.save(series);
  }

  async delete(id: string): Promise<void> {
    const series = await this.repo.findOne({ where: { id } });
    if (!series) throw new NotFoundError('Series');
    await this.repo.remove(series);
  }
}
