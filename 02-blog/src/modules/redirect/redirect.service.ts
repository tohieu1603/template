import { AppDataSource } from '../../config/database.config';
import { Redirect } from './entities/redirect.entity';
import { CreateRedirectDto, UpdateRedirectDto, RedirectQueryDto } from './dto/redirect.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class RedirectService {
  private repo = AppDataSource.getRepository(Redirect);

  async findAll(query: RedirectQueryDto) {
    const { page = 1, limit = 20, search, isActive } = query;
    const qb = this.repo.createQueryBuilder('r').orderBy('r.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('r.fromPath ILIKE :s OR r.toPath ILIKE :s', { s: `%${search}%` });
    if (isActive !== undefined) qb.andWhere('r.isActive = :isActive', { isActive: isActive === 'true' });

    const [redirects, total] = await qb.getManyAndCount();
    return { redirects, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<Redirect> {
    const redirect = await this.repo.findOne({ where: { id } });
    if (!redirect) throw new NotFoundError('Redirect');
    return redirect;
  }

  async findByFromPath(fromPath: string): Promise<Redirect | null> {
    return this.repo.findOne({ where: { fromPath, isActive: true } });
  }

  async create(dto: CreateRedirectDto): Promise<Redirect> {
    const existing = await this.repo.findOne({ where: { fromPath: dto.fromPath } });
    if (existing) throw new ConflictError(`Redirect from '${dto.fromPath}' already exists`);
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateRedirectDto): Promise<Redirect> {
    const redirect = await this.findById(id);
    Object.assign(redirect, dto);
    return this.repo.save(redirect);
  }

  async delete(id: string): Promise<void> {
    const redirect = await this.findById(id);
    await this.repo.remove(redirect);
  }

  async incrementHitCount(id: string): Promise<void> {
    await this.repo.increment({ id }, 'hitCount', 1);
  }
}
