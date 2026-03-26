import { AppDataSource } from '../../config/database.config';
import { Banner } from './entities/banner.entity';
import { CreateBannerDto, UpdateBannerDto, BannerQueryDto } from './dto/banner.dto';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class BannerService {
  private repo = AppDataSource.getRepository(Banner);

  async findAll(query: BannerQueryDto) {
    const { page = 1, limit = 20, isActive, position } = query;
    const qb = this.repo.createQueryBuilder('b').orderBy('b.sortOrder').addOrderBy('b.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (isActive !== undefined) qb.where('b.isActive = :isActive', { isActive: isActive === 'true' });
    if (position) qb.andWhere('b.position = :position', { position });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
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
    const banner = await this.repo.findOne({ where: { id } });
    if (!banner) throw new NotFoundError('Banner');
    Object.assign(banner, dto);
    return this.repo.save(banner);
  }

  async delete(id: string): Promise<void> {
    const banner = await this.repo.findOne({ where: { id } });
    if (!banner) throw new NotFoundError('Banner');
    await this.repo.remove(banner);
  }
}
