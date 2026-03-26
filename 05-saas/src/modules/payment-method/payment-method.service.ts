import { AppDataSource } from '../../config/database.config';
import { PaymentMethod } from './entities/payment-method.entity';
import { CreatePaymentMethodDto } from './dto/payment-method.dto';
import { NotFoundError } from '../../common/errors/app-error';

export class PaymentMethodService {
  private repo = AppDataSource.getRepository(PaymentMethod);

  async findAll(orgId: string): Promise<PaymentMethod[]> {
    return this.repo.find({ where: { organizationId: orgId }, order: { isDefault: 'DESC', createdAt: 'DESC' } });
  }

  async findById(id: string, orgId: string): Promise<PaymentMethod> {
    const pm = await this.repo.findOne({ where: { id, organizationId: orgId } });
    if (!pm) throw new NotFoundError('Payment method');
    return pm;
  }

  async add(orgId: string, dto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    if (dto.isDefault) {
      await this.repo.update({ organizationId: orgId }, { isDefault: false });
    }
    const pm = this.repo.create({ ...dto, organizationId: orgId });
    return this.repo.save(pm);
  }

  async setDefault(id: string, orgId: string): Promise<PaymentMethod> {
    await this.repo.update({ organizationId: orgId }, { isDefault: false });
    const pm = await this.findById(id, orgId);
    pm.isDefault = true;
    return this.repo.save(pm);
  }

  async remove(id: string, orgId: string): Promise<void> {
    const pm = await this.findById(id, orgId);
    await this.repo.remove(pm);
  }
}
