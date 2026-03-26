import { AppDataSource } from '../../config/database.config';
import { Banner } from './entities/banner.entity';
import { CreateBannerDto, UpdateBannerDto, BannerQueryDto } from './dto/banner.dto';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class BannerService {
  private repo = AppDataSource.getRepository(Banner);

  async findAll(query: BannerQueryDto) {
    const { page = 1, limit = 10, search, position } = query;
    const qb = this.repo.createQueryBuilder('b').orderBy('b.sortOrder', 'ASC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('b.title ILIKE :s', { s: `%${search}%` });
    if (position) qb.andWhere('b.position = :position', { position });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findOne(id: string) {
    const banner = await this.repo.findOne({ where: { id } });
    if (!banner) throw new NotFoundError('Banner');
    return banner;
  }

  async create(dto: CreateBannerDto) {
    const banner = this.repo.create(dto);
    return this.repo.save(banner);
  }

  async update(id: string, dto: UpdateBannerDto) {
    const banner = await this.findOne(id);
    Object.assign(banner, dto);
    return this.repo.save(banner);
  }

  async remove(id: string): Promise<void> {
    const banner = await this.findOne(id);
    await this.repo.remove(banner);
  }
}
