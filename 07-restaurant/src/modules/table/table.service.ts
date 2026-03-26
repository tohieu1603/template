import { AppDataSource } from '../../config/database.config';
import { RestaurantTable } from './entities/table.entity';
import { CreateTableDto, UpdateTableDto, UpdateTableStatusDto, TableQueryDto } from './dto/table.dto';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class TableService {
  private repo = AppDataSource.getRepository(RestaurantTable);

  async findAll(query: TableQueryDto) {
    const { page = 1, limit = 10, search, zone, status, isActive } = query;
    const qb = this.repo.createQueryBuilder('t').orderBy('t.sortOrder', 'ASC').addOrderBy('t.tableNumber', 'ASC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('t.tableNumber ILIKE :s', { s: `%${search}%` });
    if (zone) qb.andWhere('t.zone = :zone', { zone });
    if (status) qb.andWhere('t.status = :status', { status });
    if (isActive !== undefined) qb.andWhere('t.isActive = :isActive', { isActive });
    const [tables, total] = await qb.getManyAndCount();
    return { tables, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<RestaurantTable> {
    const table = await this.repo.findOne({ where: { id } });
    if (!table) throw new NotFoundError('Table');
    return table;
  }

  async create(dto: CreateTableDto): Promise<RestaurantTable> {
    const existing = await this.repo.findOne({ where: { tableNumber: dto.tableNumber } });
    if (existing) throw new ConflictError(`Table number '${dto.tableNumber}' already exists`);
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateTableDto): Promise<RestaurantTable> {
    const table = await this.findById(id);
    if (dto.tableNumber && dto.tableNumber !== table.tableNumber) {
      const existing = await this.repo.findOne({ where: { tableNumber: dto.tableNumber } });
      if (existing) throw new ConflictError(`Table number '${dto.tableNumber}' already exists`);
    }
    Object.assign(table, dto);
    return this.repo.save(table);
  }

  async updateStatus(id: string, dto: UpdateTableStatusDto): Promise<RestaurantTable> {
    const table = await this.findById(id);
    table.status = dto.status;
    return this.repo.save(table);
  }

  async delete(id: string): Promise<void> {
    const table = await this.findById(id);
    await this.repo.remove(table);
  }
}
