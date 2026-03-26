import { AppDataSource } from '../../config/database.config';
import { ContactSubmission } from './entities/contact-submission.entity';
import { CreateContactDto, ContactQueryDto } from './dto/contact.dto';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class ContactService {
  private repo = AppDataSource.getRepository(ContactSubmission);

  async findAll(query: ContactQueryDto) {
    const { page = 1, limit = 10, search, isRead } = query;
    const qb = this.repo.createQueryBuilder('c').orderBy('c.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('(c.name ILIKE :s OR c.email ILIKE :s OR c.subject ILIKE :s)', { s: `%${search}%` });
    if (isRead !== undefined) qb.andWhere('c.isRead = :isRead', { isRead: isRead === 'true' });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findOne(id: string) {
    const contact = await this.repo.findOne({ where: { id } });
    if (!contact) throw new NotFoundError('Contact submission');
    return contact;
  }

  async create(dto: CreateContactDto, ip: string) {
    const contact = this.repo.create({ ...dto, ipAddress: ip });
    return this.repo.save(contact);
  }

  async markRead(id: string) {
    const contact = await this.findOne(id);
    contact.isRead = true;
    return this.repo.save(contact);
  }

  async remove(id: string): Promise<void> {
    const contact = await this.findOne(id);
    await this.repo.remove(contact);
  }
}
