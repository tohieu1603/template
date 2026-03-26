import { AppDataSource } from '../../config/database.config';
import { Project } from './entities/project.entity';
import { ProjectImage } from './entities/project-image.entity';
import { Technology } from '../technology/entities/technology.entity';
import { CreateProjectDto, UpdateProjectDto, CreateProjectImageDto, ProjectQueryDto } from './dto/project.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class ProjectService {
  private repo = AppDataSource.getRepository(Project);
  private imageRepo = AppDataSource.getRepository(ProjectImage);
  private techRepo = AppDataSource.getRepository(Technology);

  async findAll(query: ProjectQueryDto) {
    const { page = 1, limit = 10, search, profileId, categoryId, status, isFeatured } = query;
    const qb = this.repo.createQueryBuilder('p')
      .leftJoinAndSelect('p.technologies', 'tech')
      .orderBy('p.sortOrder', 'ASC')
      .addOrderBy('p.createdAt', 'DESC')
      .limit(limit).offset((page - 1) * limit);
    if (search) qb.where('(p.title ILIKE :s OR p.shortDescription ILIKE :s)', { s: `%${search}%` });
    if (profileId) qb.andWhere('p.profileId = :profileId', { profileId });
    if (categoryId) qb.andWhere('p.categoryId = :categoryId', { categoryId });
    if (status) qb.andWhere('p.status = :status', { status });
    if (isFeatured !== undefined) qb.andWhere('p.isFeatured = :isFeatured', { isFeatured: isFeatured === 'true' });
    const [projects, total] = await qb.getManyAndCount();
    return { projects, meta: buildPaginationMeta(page, limit, total) };
  }

  async findBySlug(slug: string) {
    const project = await this.repo.findOne({ where: { slug }, relations: ['technologies'] });
    if (!project) throw new NotFoundError('Project');
    const images = await this.imageRepo.find({ where: { projectId: project.id }, order: { sortOrder: 'ASC' } });
    return { ...project, images };
  }

  async findById(id: string) {
    const project = await this.repo.findOne({ where: { id }, relations: ['technologies'] });
    if (!project) throw new NotFoundError('Project');
    const images = await this.imageRepo.find({ where: { projectId: id }, order: { sortOrder: 'ASC' } });
    return { ...project, images };
  }

  async create(dto: CreateProjectDto) {
    const existing = await this.repo.findOne({ where: { slug: dto.slug } });
    if (existing) throw new ConflictError(`Slug '${dto.slug}' already exists`);
    const { technologyIds, ...projectData } = dto;
    const project = this.repo.create(projectData);
    if (technologyIds?.length) {
      project.technologies = await this.techRepo.findByIds(technologyIds);
    }
    return this.repo.save(project);
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.repo.findOne({ where: { id }, relations: ['technologies'] });
    if (!project) throw new NotFoundError('Project');
    const { technologyIds, ...projectData } = dto;
    Object.assign(project, projectData);
    if (technologyIds !== undefined) {
      project.technologies = technologyIds.length ? await this.techRepo.findByIds(technologyIds) : [];
    }
    return this.repo.save(project);
  }

  async delete(id: string) {
    const project = await this.repo.findOne({ where: { id } });
    if (!project) throw new NotFoundError('Project');
    await this.repo.remove(project);
  }

  async incrementViewCount(id: string) {
    await this.repo.increment({ id }, 'viewCount', 1);
  }

  // Images
  async addImage(dto: CreateProjectImageDto) {
    return this.imageRepo.save(this.imageRepo.create(dto));
  }

  async deleteImage(id: string) {
    const image = await this.imageRepo.findOne({ where: { id } });
    if (!image) throw new NotFoundError('Project image');
    await this.imageRepo.remove(image);
  }
}
