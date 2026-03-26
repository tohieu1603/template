import { AppDataSource } from '../../config/database.config';
import { Invoice } from './entities/invoice.entity';
import { InvoiceQueryDto, MarkPaidDto } from './dto/invoice.dto';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class InvoiceService {
  private repo = AppDataSource.getRepository(Invoice);

  async findAll(orgId: string, query: InvoiceQueryDto) {
    const { page = 1, limit = 10, status } = query;
    const qb = this.repo.createQueryBuilder('i')
      .where('i.organizationId = :orgId', { orgId })
      .orderBy('i.createdAt', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit);
    if (status) qb.andWhere('i.status = :status', { status });
    const [invoices, total] = await qb.getManyAndCount();
    return { invoices, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string, orgId: string): Promise<Invoice> {
    const invoice = await this.repo.findOne({ where: { id, organizationId: orgId } });
    if (!invoice) throw new NotFoundError('Invoice');
    return invoice;
  }

  async markPaid(id: string, orgId: string, dto: MarkPaidDto): Promise<Invoice> {
    const invoice = await this.findById(id, orgId);
    invoice.status = 'paid';
    invoice.paidAt = new Date();
    if (dto.pdfUrl) invoice.pdfUrl = dto.pdfUrl;
    return this.repo.save(invoice);
  }

  generateInvoiceNumber(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const rand = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `INV-${y}${m}-${rand}`;
  }
}
