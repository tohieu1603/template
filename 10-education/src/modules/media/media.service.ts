import path from 'path';
import fs from 'fs';
import { AppDataSource } from '../../config/database.config';
import { Media } from './entities/media.entity';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';
import { env } from '../../config/env.config';

export class MediaService {
  private repo = AppDataSource.getRepository(Media);

  async findAll(query: any) {
    const { page = 1, limit = 20, search, folder, mimeType } = query;
    const offset = (page - 1) * limit;
    const qb = this.repo.createQueryBuilder('m').orderBy('m.createdAt', 'DESC').limit(limit).offset(offset);
    if (search) qb.where('m.originalName ILIKE :s', { s: `%${search}%` });
    if (folder) qb.andWhere('m.folder = :folder', { folder });
    if (mimeType) qb.andWhere('m.mimeType LIKE :mt', { mt: `${mimeType}%` });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const media = await this.repo.findOne({ where: { id } });
    if (!media) throw new NotFoundError('Media');
    return media;
  }

  async upload(file: Express.Multer.File, userId: string, folder?: string): Promise<Media> {
    const url = `/uploads/${file.filename}`;
    const media = this.repo.create({
      uploadedBy: userId,
      fileName: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      url,
      folder: folder ?? 'general',
    });
    return this.repo.save(media);
  }

  async update(id: string, dto: any) {
    const media = await this.repo.findOne({ where: { id } });
    if (!media) throw new NotFoundError('Media');
    Object.assign(media, dto);
    return this.repo.save(media);
  }

  async delete(id: string) {
    const media = await this.repo.findOne({ where: { id } });
    if (!media) throw new NotFoundError('Media');
    const filePath = path.join(env.UPLOAD_DIR, media.fileName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await this.repo.remove(media);
  }
}
