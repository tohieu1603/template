import { AppDataSource } from '../../config/database.config';
import { Experience } from './entities/experience.entity';
import { CreateExperienceDto, UpdateExperienceDto, ExperienceQueryDto } from './dto/experience.dto';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class ExperienceService {
  private repo = AppDataSource.getRepository(Experience);

  async findAll(query: ExperienceQueryDto) {
    const { page = 1, limit = 10, profileId, type } = query;
    const qb = this.repo.createQueryBuilder('e').orderBy('e.sortOrder', 'ASC').addOrderBy('e.startDate', 'DESC').limit(limit).offset((page - 1) * limit);
    if (profileId) qb.where('e.profileId = :profileId', { profileId });
    if (type) qb.andWhere('e.type = :type', { type });
    const [experiences, total] = await qb.getManyAndCount();
    return { experiences, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const exp = await this.repo.findOne({ where: { id } });
    if (!exp) throw new NotFoundError('Experience');
    return exp;
  }

  async create(dto: CreateExperienceDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateExperienceDto) {
    const exp = await this.findById(id);
    Object.assign(exp, dto);
    return this.repo.save(exp);
  }

  async delete(id: string) {
    const exp = await this.findById(id);
    await this.repo.remove(exp);
  }
}
