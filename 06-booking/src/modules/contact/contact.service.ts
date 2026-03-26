import { AppDataSource } from '../../config/database.config';
import { ContactSubmission } from './entities/contact-submission.entity';
import { CreateContactDto, UpdateContactStatusDto, ContactQueryDto } from './dto/contact.dto';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class ContactService {
  private repo = AppDataSource.getRepository(ContactSubmission);

  async findAll(query: ContactQueryDto) {
    const { page = 1, limit = 10, search, status } = query;
    const qb = this.repo.createQueryBuilder('c').orderBy('c.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('c.name ILIKE :s OR c.email ILIKE :s', { s: `%${search}%` });
    if (status) qb.andWhere('c.status = :status', { status });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<ContactSubmission> {
    const contact = await this.repo.findOne({ where: { id } });
    if (!contact) throw new NotFoundError('Contact submission');
    return contact;
  }

  async create(dto: CreateContactDto): Promise<ContactSubmission> {
    return this.repo.save(this.repo.create(dto));
  }

  async updateStatus(id: string, dto: UpdateContactStatusDto): Promise<ContactSubmission> {
    const contact = await this.repo.findOne({ where: { id } });
    if (!contact) throw new NotFoundError('Contact submission');
    Object.assign(contact, dto);
    return this.repo.save(contact);
  }

  async delete(id: string): Promise<void> {
    const contact = await this.repo.findOne({ where: { id } });
    if (!contact) throw new NotFoundError('Contact submission');
    await this.repo.remove(contact);
  }
}
