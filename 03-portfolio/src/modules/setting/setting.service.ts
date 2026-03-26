import { AppDataSource } from '../../config/database.config';
import { Setting, SettingType } from './entities/setting.entity';
import { CreateSettingDto, UpdateSettingDto, BulkUpdateSettingDto, SettingQueryDto } from './dto/setting.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class SettingService {
  private repo = AppDataSource.getRepository(Setting);

  async findAll(query: SettingQueryDto) {
    const { page = 1, limit = 100, group } = query;
    const qb = this.repo.createQueryBuilder('s').orderBy('s.groupName', 'ASC').addOrderBy('s.key', 'ASC').limit(limit).offset((page - 1) * limit);
    if (group) qb.where('s.groupName = :group', { group });
    const [settings, total] = await qb.getManyAndCount();
    return { settings, meta: buildPaginationMeta(page, limit, total) };
  }

  async findByKey(key: string) {
    const setting = await this.repo.findOne({ where: { key } });
    if (!setting) throw new NotFoundError('Setting');
    return setting;
  }

  async create(dto: CreateSettingDto) {
    const existing = await this.repo.findOne({ where: { key: dto.key } });
    if (existing) throw new ConflictError(`Setting key '${dto.key}' already exists`);
    const setting = this.repo.create({
      key: dto.key,
      value: dto.value,
      type: (dto.type as SettingType) ?? 'string',
      groupName: dto.groupName,
      description: dto.description,
    });
    return this.repo.save(setting);
  }

  async update(key: string, dto: UpdateSettingDto) {
    const setting = await this.findByKey(key);
    setting.value = dto.value;
    return this.repo.save(setting);
  }

  async bulkUpdate(dto: BulkUpdateSettingDto) {
    for (const { key, value } of dto.settings) {
      await this.repo.update({ key }, { value });
    }
  }

  async delete(key: string) {
    const setting = await this.findByKey(key);
    await this.repo.remove(setting);
  }
}
