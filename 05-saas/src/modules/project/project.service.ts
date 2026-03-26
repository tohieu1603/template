import { AppDataSource } from '../../config/database.config';
import { Project } from './entities/project.entity';
import { CreateProjectDto, UpdateProjectDto, ProjectQueryDto } from './dto/project.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';
import { generateSlug } from '../../common/utils/slug.util';

export class ProjectService {
  private repo = AppDataSource.getRepository(Project);

  async findAll(orgId: string, query: ProjectQueryDto) {
    const { page = 1, limit = 10, search, status } = query;
    const qb = this.repo.createQueryBuilder('p')
      .where('p.organizationId = :orgId', { orgId })
      .orderBy('p.createdAt', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit);
    if (search) qb.andWhere('p.name ILIKE :s OR p.slug ILIKE :s', { s: `%${search}%` });
    if (status) qb.andWhere('p.status = :status', { status });
    const [projects, total] = await qb.getManyAndCount();
    return { projects, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string, orgId: string): Promise<Project> {
    const p = await this.repo.findOne({ where: { id, organizationId: orgId } });
    if (!p) throw new NotFoundError('Project');
    return p;
  }

  async create(orgId: string, dto: CreateProjectDto, userId: string): Promise<Project> {
    const slug = dto.slug ?? generateSlug(dto.name);
    const existing = await this.repo.findOne({ where: { organizationId: orgId, slug } });
    if (existing) throw new ConflictError(`Project slug '${slug}' already exists in this organization`);

    return this.repo.save(this.repo.create({ ...dto, slug, organizationId: orgId, createdBy: userId }));
  }

  async update(id: string, orgId: string, dto: UpdateProjectDto): Promise<Project> {
    const p = await this.findById(id, orgId);
    Object.assign(p, dto);
    return this.repo.save(p);
  }

  async delete(id: string, orgId: string): Promise<void> {
    const p = await this.findById(id, orgId);
    await this.repo.remove(p);
  }
}
