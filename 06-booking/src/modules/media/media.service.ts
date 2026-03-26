import { AppDataSource } from '../../config/database.config';
import { Media } from './entities/media.entity';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class MediaService {
  private repo = AppDataSource.getRepository(Media);

  async findAll(query: any) {
    const { page = 1, limit = 20 } = query;
    const qb = this.repo.createQueryBuilder('m').orderBy('m.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<Media> {
    const media = await this.repo.findOne({ where: { id } });
    if (!media) throw new NotFoundError('Media');
    return media;
  }

  async save(fileData: Partial<Media>): Promise<Media> {
    return this.repo.save(this.repo.create(fileData));
  }

  async delete(id: string): Promise<void> {
    const media = await this.repo.findOne({ where: { id } });
    if (!media) throw new NotFoundError('Media');
    await this.repo.remove(media);
  }
}
