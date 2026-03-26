import { AppDataSource } from '../../config/database.config';
import { Address } from './entities/address.entity';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { NotFoundError, ForbiddenError } from '../../common/errors/app-error';

/**
 * Address management service for user shipping addresses.
 */
export class AddressService {
  private repo = AppDataSource.getRepository(Address);

  async findByUser(userId: string): Promise<Address[]> {
    return this.repo.find({ where: { userId }, order: { isDefault: 'DESC', createdAt: 'ASC' } });
  }

  async findById(id: string, userId: string): Promise<Address> {
    const address = await this.repo.findOne({ where: { id } });
    if (!address) throw new NotFoundError('Address');
    if (address.userId !== userId) throw new ForbiddenError('Access denied');
    return address;
  }

  async create(userId: string, dto: CreateAddressDto): Promise<Address> {
    if (dto.isDefault) {
      await this.repo.update({ userId }, { isDefault: false });
    }

    // If first address, set as default
    const count = await this.repo.count({ where: { userId } });
    const address = this.repo.create({ ...dto, userId, isDefault: dto.isDefault ?? count === 0 });
    return this.repo.save(address);
  }

  async update(id: string, userId: string, dto: UpdateAddressDto): Promise<Address> {
    const address = await this.findById(id, userId);

    if (dto.isDefault) {
      await this.repo.update({ userId }, { isDefault: false });
    }

    Object.assign(address, dto);
    return this.repo.save(address);
  }

  async delete(id: string, userId: string): Promise<void> {
    const address = await this.findById(id, userId);
    await this.repo.remove(address);
  }

  async setDefault(id: string, userId: string): Promise<Address> {
    const address = await this.findById(id, userId);
    await this.repo.update({ userId }, { isDefault: false });
    address.isDefault = true;
    return this.repo.save(address);
  }
}
