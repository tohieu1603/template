import { AppDataSource } from '../../config/database.config';
import { Technology } from './entities/technology.entity';
import { CreateTechnologyDto, UpdateTechnologyDto, TechnologyQueryDto } from './dto/technology.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class TechnologyService {
  private repo = AppDataSource.getRepository(Technology);

  async findAll(query: TechnologyQueryDto) {
    const { page = 1, limit = 50, search } = query;
    const qb = this.repo.createQueryBuilder('t').orderBy('t.name', 'ASC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('t.name ILIKE :s', { s: `%${search}%` });
    const [technologies, total] = await qb.getManyAndCount();
    return { technologies, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const tech = await this.repo.findOne({ where: { id } });
    if (!tech) throw new NotFoundError('Technology');
    return tech;
  }

  async create(dto: CreateTechnologyDto) {
    const existing = await this.repo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictError(`Technology '${dto.name}' already exists`);
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateTechnologyDto) {
    const tech = await this.findById(id);
    Object.assign(tech, dto);
    return this.repo.save(tech);
  }

  async delete(id: string) {
    const tech = await this.findById(id);
    await this.repo.remove(tech);
  }
}
