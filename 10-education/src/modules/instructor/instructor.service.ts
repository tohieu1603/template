import { AppDataSource } from '../../config/database.config';
import { Instructor } from './entities/instructor.entity';
import { CreateInstructorDto, UpdateInstructorDto, InstructorQueryDto } from './dto/instructor.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';
import { generateSlug } from '../../common/utils/slug.util';

export class InstructorService {
  private repo = AppDataSource.getRepository(Instructor);

  async findAll(query: InstructorQueryDto) {
    const { page = 1, limit = 10, search, isVerified } = query;
    const offset = (page - 1) * limit;
    const qb = this.repo.createQueryBuilder('i').orderBy('i.createdAt', 'DESC').limit(limit).offset(offset);
    if (search) qb.where('i.name ILIKE :s OR i.shortBio ILIKE :s', { s: `%${search}%` });
    if (isVerified !== undefined) qb.andWhere('i.isVerified = :v', { v: isVerified === 'true' });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const instructor = await this.repo.findOne({ where: { id } });
    if (!instructor) throw new NotFoundError('Instructor');
    return instructor;
  }

  async findBySlug(slug: string) {
    const instructor = await this.repo.findOne({ where: { slug } });
    if (!instructor) throw new NotFoundError('Instructor');
    return instructor;
  }

  async create(dto: CreateInstructorDto) {
    const existing = await this.repo.findOne({ where: { userId: dto.userId } });
    if (existing) throw new ConflictError('Instructor profile already exists for this user');
    const slug = generateSlug(dto.name);
    const instructor = this.repo.create({ ...dto, slug });
    return this.repo.save(instructor);
  }

  async update(id: string, dto: UpdateInstructorDto) {
    const instructor = await this.repo.findOne({ where: { id } });
    if (!instructor) throw new NotFoundError('Instructor');
    if (dto.name) instructor.slug = generateSlug(dto.name);
    Object.assign(instructor, dto);
    return this.repo.save(instructor);
  }

  async verify(id: string, isVerified: boolean) {
    const instructor = await this.repo.findOne({ where: { id } });
    if (!instructor) throw new NotFoundError('Instructor');
    instructor.isVerified = isVerified;
    return this.repo.save(instructor);
  }

  async delete(id: string) {
    const instructor = await this.repo.findOne({ where: { id } });
    if (!instructor) throw new NotFoundError('Instructor');
    await this.repo.remove(instructor);
  }
}
