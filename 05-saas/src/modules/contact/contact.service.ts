import { AppDataSource } from '../../config/database.config';
import { ContactSubmission } from './entities/contact-submission.entity';
import { CreateContactDto, UpdateContactDto, ContactQueryDto } from './dto/contact.dto';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class ContactService {
  private repo = AppDataSource.getRepository(ContactSubmission);

  async findAll(query: ContactQueryDto) {
    const { page = 1, limit = 10, search, status } = query;
    const qb = this.repo.createQueryBuilder('c').orderBy('c.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('c.name ILIKE :s OR c.email ILIKE :s', { s: `%${search}%` });
    if (status) qb.andWhere('c.status = :status', { status });
    const [submissions, total] = await qb.getManyAndCount();
    return { submissions, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<ContactSubmission> {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundError('Contact submission');
    return s;
  }

  async create(dto: CreateContactDto): Promise<ContactSubmission> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateContactDto): Promise<ContactSubmission> {
    const s = await this.findById(id);
    s.status = dto.status;
    if (dto.status === 'replied') s.repliedAt = new Date();
    return this.repo.save(s);
  }

  async delete(id: string): Promise<void> {
    const s = await this.findById(id);
    await this.repo.remove(s);
  }
}
