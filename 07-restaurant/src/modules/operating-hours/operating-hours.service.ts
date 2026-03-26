import { AppDataSource } from '../../config/database.config';
import { OperatingHours } from './entities/operating-hours.entity';
import { CreateOperatingHoursDto, UpdateOperatingHoursDto } from './dto/operating-hours.dto';
import { NotFoundError, ConflictError } from '../../common/errors/app-error';

export class OperatingHoursService {
  private repo = AppDataSource.getRepository(OperatingHours);

  async findAll() {
    return this.repo.find({ order: { dayOfWeek: 'ASC' } });
  }

  async findById(id: string): Promise<OperatingHours> {
    const oh = await this.repo.findOne({ where: { id } });
    if (!oh) throw new NotFoundError('Operating hours');
    return oh;
  }

  async create(dto: CreateOperatingHoursDto): Promise<OperatingHours> {
    const existing = await this.repo.findOne({ where: { dayOfWeek: dto.dayOfWeek } });
    if (existing) throw new ConflictError(`Operating hours for day ${dto.dayOfWeek} already exist`);
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateOperatingHoursDto): Promise<OperatingHours> {
    const oh = await this.findById(id);
    Object.assign(oh, dto);
    return this.repo.save(oh);
  }

  async delete(id: string): Promise<void> {
    const oh = await this.findById(id);
    await this.repo.remove(oh);
  }
}
