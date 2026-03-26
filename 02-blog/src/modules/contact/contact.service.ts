import { AppDataSource } from '../../config/database.config';
import { ContactSubmission } from './entities/contact-submission.entity';
import { CreateContactDto, ContactQueryDto } from './dto/contact.dto';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class ContactService {
  private repo = AppDataSource.getRepository(ContactSubmission);

  async findAll(query: ContactQueryDto) {
    const { page = 1, limit = 20, search, status } = query;
    const qb = this.repo.createQueryBuilder('c').orderBy('c.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('c.name ILIKE :s OR c.email ILIKE :s OR c.subject ILIKE :s', { s: `%${search}%` });
    if (status === 'read') qb.andWhere('c.isRead = true');
    if (status === 'unread') qb.andWhere('c.isRead = false');

    const [contacts, total] = await qb.getManyAndCount();
    return { contacts, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<ContactSubmission> {
    const contact = await this.repo.findOne({ where: { id } });
    if (!contact) throw new NotFoundError('Contact submission');
    return contact;
  }

  async submit(dto: CreateContactDto): Promise<ContactSubmission> {
    return this.repo.save(this.repo.create(dto));
  }

  async markAsRead(id: string): Promise<ContactSubmission> {
    const contact = await this.findById(id);
    contact.isRead = true;
    contact.repliedAt = new Date();
    return this.repo.save(contact);
  }

  async delete(id: string): Promise<void> {
    const contact = await this.findById(id);
    await this.repo.remove(contact);
  }
}
