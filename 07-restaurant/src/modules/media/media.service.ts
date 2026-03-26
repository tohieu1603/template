import { AppDataSource } from '../../config/database.config';
import { Media } from './entities/media.entity';
import { UpdateMediaDto, MediaQueryDto } from './dto/media.dto';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';
import fs from 'fs';
import path from 'path';

export class MediaService {
  private repo = AppDataSource.getRepository(Media);

  async findAll(query: MediaQueryDto) {
    const { page = 1, limit = 20, type, folder } = query;
    const qb = this.repo.createQueryBuilder('m').orderBy('m.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (type) qb.where('m.type = :type', { type });
    if (folder) qb.andWhere('m.folder = :folder', { folder });
    const [media, total] = await qb.getManyAndCount();
    return { media, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<Media> {
    const m = await this.repo.findOne({ where: { id } });
    if (!m) throw new NotFoundError('Media');
    return m;
  }

  async upload(file: Express.Multer.File, uploadedBy?: string): Promise<Media> {
    const mimeType = file.mimetype;
    let type = 'document';
    if (mimeType.startsWith('image/')) type = 'image';
    else if (mimeType.startsWith('video/')) type = 'video';

    const url = `/uploads/${file.filename}`;
    return this.repo.save(this.repo.create({
      uploadedBy,
      filename: file.filename,
      originalName: file.originalname,
      mimeType,
      type,
      sizeBytes: file.size,
      url,
    }));
  }

  async update(id: string, dto: UpdateMediaDto): Promise<Media> {
    const media = await this.findById(id);
    Object.assign(media, dto);
    return this.repo.save(media);
  }

  async delete(id: string): Promise<void> {
    const media = await this.findById(id);
    const filePath = path.join(process.cwd(), media.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await this.repo.remove(media);
  }
}
