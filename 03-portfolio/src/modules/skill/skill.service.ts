import { AppDataSource } from '../../config/database.config';
import { Skill } from './entities/skill.entity';
import { CreateSkillDto, UpdateSkillDto, SkillQueryDto } from './dto/skill.dto';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class SkillService {
  private repo = AppDataSource.getRepository(Skill);

  async findAll(query: SkillQueryDto) {
    const { page = 1, limit = 20, search, profileId, category } = query;
    const qb = this.repo.createQueryBuilder('s').orderBy('s.sortOrder', 'ASC').addOrderBy('s.level', 'DESC').limit(limit).offset((page - 1) * limit);
    if (profileId) qb.where('s.profileId = :profileId', { profileId });
    if (category) qb.andWhere('s.category = :category', { category });
    if (search) qb.andWhere('s.name ILIKE :s', { s: `%${search}%` });
    const [skills, total] = await qb.getManyAndCount();
    return { skills, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const skill = await this.repo.findOne({ where: { id } });
    if (!skill) throw new NotFoundError('Skill');
    return skill;
  }

  async create(dto: CreateSkillDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateSkillDto) {
    const skill = await this.findById(id);
    Object.assign(skill, dto);
    return this.repo.save(skill);
  }

  async delete(id: string) {
    const skill = await this.findById(id);
    await this.repo.remove(skill);
  }
}
