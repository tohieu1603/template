import { AppDataSource } from '../../config/database.config';
import { ContactSubmission } from './entities/contact-submission.entity';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class ContactService {
  private repo = AppDataSource.getRepository(ContactSubmission);

  async findAll(query: any) {
    const { page = 1, limit = 10, search, status } = query;
    const offset = (page - 1) * limit;
    const qb = this.repo.createQueryBuilder('c').orderBy('c.createdAt', 'DESC').limit(limit).offset(offset);
    if (search) qb.where('c.name ILIKE :s OR c.email ILIKE :s OR c.subject ILIKE :s', { s: `%${search}%` });
    if (status) qb.andWhere('c.status = :status', { status });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const contact = await this.repo.findOne({ where: { id } });
    if (!contact) throw new NotFoundError('Contact');
    return contact;
  }

  async create(dto: any) {
    const contact = this.repo.create(dto);
    return this.repo.save(contact);
  }

  async reply(id: string, adminReply: string) {
    const contact = await this.repo.findOne({ where: { id } });
    if (!contact) throw new NotFoundError('Contact');
    contact.adminReply = adminReply;
    contact.status = 'replied';
    return this.repo.save(contact);
  }

  async updateStatus(id: string, status: string) {
    const contact = await this.repo.findOne({ where: { id } });
    if (!contact) throw new NotFoundError('Contact');
    contact.status = status;
    return this.repo.save(contact);
  }

  async delete(id: string) {
    const contact = await this.repo.findOne({ where: { id } });
    if (!contact) throw new NotFoundError('Contact');
    await this.repo.remove(contact);
  }
}
