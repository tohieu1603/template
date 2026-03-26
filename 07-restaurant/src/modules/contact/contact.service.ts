import { AppDataSource } from '../../config/database.config';
import { ContactSubmission } from './entities/contact-submission.entity';
import { CreateContactDto, ContactQueryDto } from './dto/contact.dto';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class ContactService {
  private repo = AppDataSource.getRepository(ContactSubmission);

  async findAll(query: ContactQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const qb = this.repo.createQueryBuilder('c').orderBy('c.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('c.name ILIKE :s OR c.email ILIKE :s OR c.subject ILIKE :s', { s: `%${search}%` });
    const [contacts, total] = await qb.getManyAndCount();
    return { contacts, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<ContactSubmission> {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new NotFoundError('Contact submission');
    return c;
  }

  async create(dto: CreateContactDto): Promise<ContactSubmission> {
    return this.repo.save(this.repo.create(dto));
  }

  async markRead(id: string): Promise<ContactSubmission> {
    const c = await this.findById(id);
    c.isRead = true;
    c.repliedAt = new Date();
    return this.repo.save(c);
  }

  async delete(id: string): Promise<void> {
    const c = await this.findById(id);
    await this.repo.remove(c);
  }
}
