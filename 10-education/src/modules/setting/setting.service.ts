import { AppDataSource } from '../../config/database.config';
import { Setting } from './entities/setting.entity';
import { CreateSettingDto, UpdateSettingDto, SettingQueryDto } from './dto/setting.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class SettingService {
  private repo = AppDataSource.getRepository(Setting);

  async findAll(query: SettingQueryDto) {
    const { page = 1, limit = 50, search, group } = query;
    const offset = (page - 1) * limit;
    const qb = this.repo.createQueryBuilder('s').orderBy('s.groupName', 'ASC').addOrderBy('s.key', 'ASC').limit(limit).offset(offset);
    if (search) qb.where('s.key ILIKE :s OR s.description ILIKE :s', { s: `%${search}%` });
    if (group) qb.andWhere('s.groupName = :group', { group });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findByKey(key: string) {
    const setting = await this.repo.findOne({ where: { key } });
    if (!setting) throw new NotFoundError('Setting');
    return setting;
  }

  async create(dto: CreateSettingDto) {
    const existing = await this.repo.findOne({ where: { key: dto.key } });
    if (existing) throw new ConflictError('Setting key already exists');
    const setting = this.repo.create(dto);
    return this.repo.save(setting);
  }

  async update(key: string, dto: UpdateSettingDto) {
    const setting = await this.repo.findOne({ where: { key } });
    if (!setting) throw new NotFoundError('Setting');
    Object.assign(setting, dto);
    return this.repo.save(setting);
  }

  async delete(key: string) {
    const setting = await this.repo.findOne({ where: { key } });
    if (!setting) throw new NotFoundError('Setting');
    await this.repo.remove(setting);
  }
}
