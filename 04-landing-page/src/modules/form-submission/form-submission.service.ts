import { AppDataSource } from '../../config/database.config';
import { FormSubmission } from './entities/form-submission.entity';
import { CreateFormSubmissionDto, FormSubmissionQueryDto } from './dto/form-submission.dto';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class FormSubmissionService {
  private repo = AppDataSource.getRepository(FormSubmission);

  async findAll(query: FormSubmissionQueryDto) {
    const { page = 1, limit = 20, formId, isRead } = query;
    const qb = this.repo.createQueryBuilder('fs').orderBy('fs.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (formId) qb.where('fs.formId = :formId', { formId });
    if (isRead !== undefined) qb.andWhere('fs.isRead = :isRead', { isRead: isRead === 'true' });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findOne(id: string) {
    const submission = await this.repo.findOne({ where: { id } });
    if (!submission) throw new NotFoundError('Form submission');
    return submission;
  }

  async create(dto: CreateFormSubmissionDto, ip: string, userAgent: string) {
    const submission = this.repo.create({ ...dto, ipAddress: ip, userAgent });
    return this.repo.save(submission);
  }

  async markRead(id: string) {
    const submission = await this.findOne(id);
    submission.isRead = true;
    return this.repo.save(submission);
  }

  async remove(id: string): Promise<void> {
    const submission = await this.findOne(id);
    await this.repo.remove(submission);
  }
}
