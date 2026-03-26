import { AppDataSource } from '../../config/database.config';
import { Banner } from './entities/banner.entity';
import { CreateBannerDto, UpdateBannerDto, BannerQueryDto } from './dto/banner.dto';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class BannerService {
  private repo = AppDataSource.getRepository(Banner);

  async findAll(query: BannerQueryDto) {
    const { page = 1, limit = 20, position, status } = query;
    const qb = this.repo.createQueryBuilder('b').orderBy('b.sortOrder', 'ASC').addOrderBy('b.rank', 'ASC').limit(limit).offset((page - 1) * limit);
    if (position) qb.where('b.position = :position', { position });
    if (status) qb.andWhere('b.status = :status', { status });

    const [banners, total] = await qb.getManyAndCount();
    return { banners, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<Banner> {
    const banner = await this.repo.findOne({ where: { id } });
    if (!banner) throw new NotFoundError('Banner');
    return banner;
  }

  async create(dto: CreateBannerDto): Promise<Banner> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateBannerDto): Promise<Banner> {
    const banner = await this.findById(id);
    Object.assign(banner, dto);
    return this.repo.save(banner);
  }

  async delete(id: string): Promise<void> {
    const banner = await this.findById(id);
    await this.repo.remove(banner);
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.repo.increment({ id }, 'viewCount', 1);
  }

  async incrementClickCount(id: string): Promise<void> {
    await this.repo.increment({ id }, 'clickCount', 1);
  }
}
