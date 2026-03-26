import { AppDataSource } from '../../config/database.config';
import { Setting } from './entities/setting.entity';
import { UpsertSettingDto } from './dto/setting.dto';
import { NotFoundError } from '../../common/errors/app-error';

export class SettingService {
  private repo = AppDataSource.getRepository(Setting);

  async findAll(group?: string) {
    const qb = this.repo.createQueryBuilder('s').orderBy('s.groupName', 'ASC').addOrderBy('s.key', 'ASC');
    if (group) qb.where('s.groupName = :group', { group });
    return qb.getMany();
  }

  async findByKey(key: string) {
    const setting = await this.repo.findOne({ where: { key } });
    if (!setting) throw new NotFoundError('Setting');
    return setting;
  }

  async upsert(dto: UpsertSettingDto) {
    await this.repo.query(
      `INSERT INTO settings (id, key, value, type, group_name, description, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2, type = $3, group_name = $4, description = $5, updated_at = NOW()`,
      [dto.key, dto.value, dto.type ?? 'string', dto.groupName ?? null, dto.description ?? null],
    );
    return this.repo.findOne({ where: { key: dto.key } });
  }

  async remove(key: string): Promise<void> {
    const setting = await this.repo.findOne({ where: { key } });
    if (!setting) throw new NotFoundError('Setting');
    await this.repo.remove(setting);
  }
}
