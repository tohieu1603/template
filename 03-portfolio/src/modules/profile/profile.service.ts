import { AppDataSource } from '../../config/database.config';
import { Profile } from './entities/profile.entity';
import { CreateProfileDto, UpdateProfileDto, ProfileQueryDto } from './dto/profile.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class ProfileService {
  private repo = AppDataSource.getRepository(Profile);

  async findAll(query: ProfileQueryDto) {
    const { page = 1, limit = 10, search, isAvailable } = query;
    const qb = this.repo.createQueryBuilder('p').orderBy('p.sortOrder', 'ASC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('(p.fullName ILIKE :s OR p.title ILIKE :s OR p.tagline ILIKE :s)', { s: `%${search}%` });
    if (isAvailable !== undefined) qb.andWhere('p.isAvailable = :isAvailable', { isAvailable: isAvailable === 'true' });
    const [profiles, total] = await qb.getManyAndCount();
    return { profiles, meta: buildPaginationMeta(page, limit, total) };
  }

  async findBySlug(slug: string) {
    const profile = await this.repo.findOne({ where: { slug } });
    if (!profile) throw new NotFoundError('Profile');
    return profile;
  }

  async findById(id: string) {
    const profile = await this.repo.findOne({ where: { id } });
    if (!profile) throw new NotFoundError('Profile');
    return profile;
  }

  async create(dto: CreateProfileDto) {
    const existing = await this.repo.findOne({ where: { slug: dto.slug } });
    if (existing) throw new ConflictError(`Profile slug '${dto.slug}' already exists`);
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateProfileDto) {
    const profile = await this.findById(id);
    if (dto.slug && dto.slug !== profile.slug) {
      const existing = await this.repo.findOne({ where: { slug: dto.slug } });
      if (existing) throw new ConflictError(`Slug '${dto.slug}' already taken`);
    }
    Object.assign(profile, dto);
    return this.repo.save(profile);
  }

  async delete(id: string) {
    const profile = await this.findById(id);
    await this.repo.remove(profile);
  }
}
