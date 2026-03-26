import { AppDataSource } from '../../config/database.config';
import { Banner } from './entities/banner.entity';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class BannerService {
  private repo = AppDataSource.getRepository(Banner);

  async findAll(query: any) {
    const { page = 1, limit = 10, search } = query;
    const offset = (page - 1) * limit;
    const qb = this.repo.createQueryBuilder('b').orderBy('b.sortOrder', 'ASC').limit(limit).offset(offset);
    if (search) qb.where('b.title ILIKE :s', { s: `%${search}%` });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const banner = await this.repo.findOne({ where: { id } });
    if (!banner) throw new NotFoundError('Banner');
    return banner;
  }

  async create(dto: any) {
    const banner = this.repo.create(dto);
    return this.repo.save(banner);
  }

  async update(id: string, dto: any) {
    const banner = await this.repo.findOne({ where: { id } });
    if (!banner) throw new NotFoundError('Banner');
    Object.assign(banner, dto);
    return this.repo.save(banner);
  }

  async delete(id: string) {
    const banner = await this.repo.findOne({ where: { id } });
    if (!banner) throw new NotFoundError('Banner');
    await this.repo.remove(banner);
  }
}
