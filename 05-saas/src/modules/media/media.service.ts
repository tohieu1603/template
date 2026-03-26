import fs from 'fs';
import path from 'path';
import { AppDataSource } from '../../config/database.config';
import { Media } from './entities/media.entity';
import { UpdateMediaDto, MediaQueryDto } from './dto/media.dto';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';
import { env } from '../../config/env.config';

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
    const media = await this.repo.findOne({ where: { id } });
    if (!media) throw new NotFoundError('Media');
    return media;
  }

  async upload(file: Express.Multer.File, uploadedBy: string, folder?: string): Promise<Media> {
    const type = file.mimetype.startsWith('image/') ? 'image'
      : file.mimetype.startsWith('video/') ? 'video' : 'document';

    const media = this.repo.create({
      uploadedBy,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      type,
      sizeBytes: file.size,
      url: `/uploads/${file.filename}`,
      folder: folder ?? 'general',
    });

    return this.repo.save(media);
  }

  async update(id: string, dto: UpdateMediaDto): Promise<Media> {
    const media = await this.findById(id);
    Object.assign(media, dto);
    return this.repo.save(media);
  }

  async delete(id: string): Promise<void> {
    const media = await this.findById(id);
    const filePath = path.join(env.UPLOAD_DIR, media.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await this.repo.remove(media);
  }
}
