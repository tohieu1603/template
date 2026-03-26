import { AppDataSource } from '../../config/database.config';
import { Setting } from './entities/setting.entity';
import { CreateSettingDto, UpdateSettingDto, SettingQueryDto } from './dto/setting.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class SettingService {
  private repo = AppDataSource.getRepository(Setting);

  async findAll(query: SettingQueryDto) {
    const { page = 1, limit = 100, groupName } = query;
    const qb = this.repo.createQueryBuilder('s').orderBy('s.groupName').addOrderBy('s.key').limit(limit).offset((page - 1) * limit);
    if (groupName) qb.where('s.groupName = :groupName', { groupName });
    const [settings, total] = await qb.getManyAndCount();
    return { settings, meta: buildPaginationMeta(page, limit, total) };
  }

  async findByKey(key: string): Promise<Setting> {
    const setting = await this.repo.findOne({ where: { key } });
    if (!setting) throw new NotFoundError('Setting');
    return setting;
  }

  async findById(id: string): Promise<Setting> {
    const setting = await this.repo.findOne({ where: { id } });
    if (!setting) throw new NotFoundError('Setting');
    return setting;
  }

  async create(dto: CreateSettingDto): Promise<Setting> {
    const existing = await this.repo.findOne({ where: { key: dto.key } });
    if (existing) throw new ConflictError(`Setting '${dto.key}' already exists`);
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateSettingDto): Promise<Setting> {
    const setting = await this.repo.findOne({ where: { id } });
    if (!setting) throw new NotFoundError('Setting');
    Object.assign(setting, dto);
    return this.repo.save(setting);
  }

  async upsert(key: string, value: string): Promise<Setting> {
    const existing = await this.repo.findOne({ where: { key } });
    if (existing) {
      existing.value = value;
      return this.repo.save(existing);
    }
    return this.repo.save(this.repo.create({ key, value }));
  }

  async delete(id: string): Promise<void> {
    const setting = await this.repo.findOne({ where: { id } });
    if (!setting) throw new NotFoundError('Setting');
    await this.repo.remove(setting);
  }
}
