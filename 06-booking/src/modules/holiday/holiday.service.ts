import { AppDataSource } from '../../config/database.config';
import { Holiday } from './entities/holiday.entity';
import { CreateHolidayDto, UpdateHolidayDto, HolidayQueryDto } from './dto/holiday.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class HolidayService {
  private repo = AppDataSource.getRepository(Holiday);

  async findAll(query: HolidayQueryDto) {
    const { page = 1, limit = 50, search, year } = query;
    const qb = this.repo.createQueryBuilder('h').orderBy('h.date', 'ASC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('h.name ILIKE :s', { s: `%${search}%` });
    if (year) qb.andWhere('EXTRACT(YEAR FROM h.date::date) = :year', { year });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<Holiday> {
    const holiday = await this.repo.findOne({ where: { id } });
    if (!holiday) throw new NotFoundError('Holiday');
    return holiday;
  }

  async create(dto: CreateHolidayDto, createdBy: string): Promise<Holiday> {
    const existing = await this.repo.findOne({ where: { date: dto.date } });
    if (existing) throw new ConflictError(`Holiday on ${dto.date} already exists`);
    return this.repo.save(this.repo.create({ ...dto, createdBy }));
  }

  async update(id: string, dto: UpdateHolidayDto): Promise<Holiday> {
    const holiday = await this.repo.findOne({ where: { id } });
    if (!holiday) throw new NotFoundError('Holiday');
    Object.assign(holiday, dto);
    return this.repo.save(holiday);
  }

  async delete(id: string): Promise<void> {
    const holiday = await this.repo.findOne({ where: { id } });
    if (!holiday) throw new NotFoundError('Holiday');
    await this.repo.remove(holiday);
  }
}
