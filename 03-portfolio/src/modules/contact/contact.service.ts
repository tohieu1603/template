import { AppDataSource } from '../../config/database.config';
import { Contact } from './entities/contact.entity';
import { CreateContactDto, UpdateContactDto, ContactQueryDto } from './dto/contact.dto';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class ContactService {
  private repo = AppDataSource.getRepository(Contact);

  async findAll(query: ContactQueryDto) {
    const { page = 1, limit = 10, search, status } = query;
    const qb = this.repo.createQueryBuilder('c').orderBy('c.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('(c.fullName ILIKE :s OR c.email ILIKE :s)', { s: `%${search}%` });
    if (status) qb.andWhere('c.status = :status', { status });
    const [contacts, total] = await qb.getManyAndCount();
    return { contacts, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const contact = await this.repo.findOne({ where: { id } });
    if (!contact) throw new NotFoundError('Contact');
    return contact;
  }

  async create(dto: CreateContactDto, ip: string) {
    return this.repo.save(this.repo.create({ ...dto, ipAddress: ip }));
  }

  async update(id: string, dto: UpdateContactDto) {
    const contact = await this.findById(id);
    Object.assign(contact, dto);
    return this.repo.save(contact);
  }

  async delete(id: string) {
    const contact = await this.findById(id);
    await this.repo.remove(contact);
  }
}
