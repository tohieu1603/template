import { AppDataSource } from '../../config/database.config';
import { Coupon } from './entities/coupon.entity';
import { Course } from '../course/entities/course.entity';
import { CreateCouponDto, UpdateCouponDto, ApplyCouponDto, CouponQueryDto } from './dto/coupon.dto';
import { ConflictError, NotFoundError, UnprocessableError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class CouponService {
  private repo = AppDataSource.getRepository(Coupon);
  private courseRepo = AppDataSource.getRepository(Course);

  async findAll(query: CouponQueryDto) {
    const { page = 1, limit = 10, search, isActive } = query;
    const offset = (page - 1) * limit;
    const qb = this.repo.createQueryBuilder('c').orderBy('c.createdAt', 'DESC').limit(limit).offset(offset);
    if (search) qb.where('c.code ILIKE :s', { s: `%${search}%` });
    if (isActive !== undefined) qb.andWhere('c.isActive = :isActive', { isActive: isActive === 'true' });
    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const coupon = await this.repo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundError('Coupon');
    return coupon;
  }

  async create(dto: CreateCouponDto) {
    const existing = await this.repo.findOne({ where: { code: dto.code } });
    if (existing) throw new ConflictError('Coupon code already exists');
    const coupon = this.repo.create({
      ...dto,
      startsAt: new Date(dto.startsAt),
      expiresAt: new Date(dto.expiresAt),
    });
    return this.repo.save(coupon);
  }

  async update(id: string, dto: UpdateCouponDto) {
    const coupon = await this.repo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundError('Coupon');
    if (dto.startsAt) (dto as any).startsAt = new Date(dto.startsAt);
    if (dto.expiresAt) (dto as any).expiresAt = new Date(dto.expiresAt);
    Object.assign(coupon, dto);
    return this.repo.save(coupon);
  }

  async delete(id: string) {
    const coupon = await this.repo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundError('Coupon');
    await this.repo.remove(coupon);
  }

  async apply(dto: ApplyCouponDto) {
    const coupon = await this.repo.findOne({ where: { code: dto.code, isActive: true } });
    if (!coupon) throw new NotFoundError('Coupon not found or inactive');

    const now = new Date();
    if (now < coupon.startsAt) throw new UnprocessableError('Coupon not yet active');
    if (now > coupon.expiresAt) throw new UnprocessableError('Coupon expired');
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new UnprocessableError('Coupon usage limit reached');

    const course = await this.courseRepo.findOne({ where: { id: dto.courseId } });
    if (!course) throw new NotFoundError('Course');

    if (coupon.courseId && coupon.courseId !== dto.courseId) throw new UnprocessableError('Coupon not valid for this course');
    if (coupon.minCoursePrice && Number(course.price) < Number(coupon.minCoursePrice)) throw new UnprocessableError('Course price below minimum for this coupon');

    let discountAmount = 0;
    if (coupon.type === 'percent') {
      discountAmount = (Number(course.price) * Number(coupon.value)) / 100;
      if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
    } else {
      discountAmount = Number(coupon.value);
    }

    const finalPrice = Math.max(0, Number(course.price) - discountAmount);
    return { coupon, originalPrice: course.price, discountAmount, finalPrice };
  }
}
