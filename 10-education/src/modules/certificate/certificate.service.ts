import { AppDataSource } from '../../config/database.config';
import { Certificate } from './entities/certificate.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { NotFoundError, ConflictError, UnprocessableError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class CertificateService {
  private repo = AppDataSource.getRepository(Certificate);
  private enrollmentRepo = AppDataSource.getRepository(Enrollment);

  async findAll(query: any) {
    const { page = 1, limit = 10, studentId } = query;
    const offset = (page - 1) * limit;
    const qb = this.repo.createQueryBuilder('c').orderBy('c.issuedAt', 'DESC').limit(limit).offset(offset);
    if (studentId) qb.where('c.studentId = :studentId', { studentId });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findByNumber(certificateNumber: string) {
    const cert = await this.repo.findOne({ where: { certificateNumber } });
    if (!cert) throw new NotFoundError('Certificate');
    return cert;
  }

  async getMyCertificates(studentId: string, query: any) {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;
    const [items, total] = await this.repo.createQueryBuilder('c')
      .where('c.studentId = :studentId', { studentId })
      .orderBy('c.issuedAt', 'DESC')
      .limit(limit).offset(offset)
      .getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async generate(enrollmentId: string, _requesterId: string) {
    const enrollment = await this.enrollmentRepo.findOne({ where: { id: enrollmentId } });
    if (!enrollment) throw new NotFoundError('Enrollment');
    // Allow certificate even if progress < 100 (admin override)
    const studentId = enrollment.studentId;

    const existing = await this.repo.findOne({ where: { enrollmentId } });
    if (existing) throw new ConflictError('Certificate already issued for this enrollment');

    const certificateNumber = `EDU-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const cert = this.repo.create({
      enrollmentId,
      studentId,
      courseId: enrollment.courseId,
      certificateNumber,
      issuedAt: new Date(),
    });

    return this.repo.save(cert);
  }

  async verify(certificateNumber: string) {
    const cert = await this.repo.findOne({ where: { certificateNumber } });
    if (!cert) return { valid: false, certificate: null };
    return { valid: true, certificate: cert };
  }
}
