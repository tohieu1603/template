import { AppDataSource } from '../../config/database.config';
import { Setting } from './entities/setting.entity';
import { UpsertSettingDto, BulkUpsertSettingDto, SettingQueryDto } from './dto/setting.dto';
import { NotFoundError } from '../../common/errors/app-error';
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

  async findByKey(key: string): Promise<Setting> {
    const setting = await this.repo.findOne({ where: { key } });
    if (!setting) throw new NotFoundError('Setting');
    return setting;
  }

  async findByGroup(group: string): Promise<Setting[]> {
    return this.repo.find({ where: { groupName: group }, order: { key: 'ASC' } });
  }

  async upsert(dto: UpsertSettingDto): Promise<Setting> {
    const existing = await this.repo.findOne({ where: { key: dto.key } });
    if (existing) {
      Object.assign(existing, dto);
      return this.repo.save(existing);
    }
    return this.repo.save(this.repo.create(dto));
  }

  async bulkUpsert(dto: BulkUpsertSettingDto): Promise<void> {
    for (const { key, value } of dto.settings) {
      await this.repo.update({ key }, { value });
    }
  }

  async delete(key: string): Promise<void> {
    const setting = await this.findByKey(key);
    await this.repo.remove(setting);
  }

  async getPublicSettings(): Promise<Record<string, any>> {
    const settings = await this.repo.find({ where: { groupName: 'public' } });
    const result: Record<string, any> = {};
    for (const s of settings) {
      result[s.key] = this.parseValue(s);
    }
    return result;
  }

  private parseValue(setting: Setting) {
    switch (setting.type) {
      case 'number': return Number(setting.value);
      case 'boolean': return setting.value === 'true';
      case 'json': try { return JSON.parse(setting.value); } catch { return setting.value; }
      default: return setting.value;
    }
  }
}
