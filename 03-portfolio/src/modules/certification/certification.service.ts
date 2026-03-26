import { AppDataSource } from '../../config/database.config';
import { Certification } from './entities/certification.entity';
import { CreateCertificationDto, UpdateCertificationDto, CertificationQueryDto } from './dto/certification.dto';
import { NotFoundError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class CertificationService {
  private repo = AppDataSource.getRepository(Certification);

  async findAll(query: CertificationQueryDto) {
    const { page = 1, limit = 10, profileId } = query;
    const qb = this.repo.createQueryBuilder('c').orderBy('c.sortOrder', 'ASC').addOrderBy('c.issueDate', 'DESC').limit(limit).offset((page - 1) * limit);
    if (profileId) qb.where('c.profileId = :profileId', { profileId });
    const [certifications, total] = await qb.getManyAndCount();
    return { certifications, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const cert = await this.repo.findOne({ where: { id } });
    if (!cert) throw new NotFoundError('Certification');
    return cert;
  }

  async create(dto: CreateCertificationDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateCertificationDto) {
    const cert = await this.findById(id);
    Object.assign(cert, dto);
    return this.repo.save(cert);
  }

  async delete(id: string) {
    const cert = await this.findById(id);
    await this.repo.remove(cert);
  }
}
