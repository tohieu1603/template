import { AppDataSource } from '../../config/database.config';
import { Coupon } from './entities/coupon.entity';
import { CreateCouponDto, UpdateCouponDto, ApplyCouponDto, CouponQueryDto } from './dto/coupon.dto';
import { ConflictError, NotFoundError, ValidationError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class CouponService {
  private repo = AppDataSource.getRepository(Coupon);

  async findAll(query: CouponQueryDto) {
    const { page = 1, limit = 10, search, status } = query;
    const qb = this.repo.createQueryBuilder('c').orderBy('c.createdAt', 'DESC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('c.code ILIKE :s', { s: `%${search}%` });
    if (status !== undefined) qb.andWhere('c.isActive = :active', { active: status === 'active' });

    const [coupons, total] = await qb.getManyAndCount();
    return { coupons, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<Coupon> {
    const coupon = await this.repo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundError('Coupon');
    return coupon;
  }

  async create(dto: CreateCouponDto): Promise<Coupon> {
    const existing = await this.repo.findOne({ where: { code: dto.code.toUpperCase() } });
    if (existing) throw new ConflictError(`Coupon code '${dto.code}' already exists`);
    return this.repo.save(this.repo.create({ ...dto, code: dto.code.toUpperCase() }));
  }

  async update(id: string, dto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.findById(id);
    Object.assign(coupon, dto);
    return this.repo.save(coupon);
  }

  async delete(id: string): Promise<void> {
    const coupon = await this.findById(id);
    await this.repo.remove(coupon);
  }

  async applyCoupon(dto: ApplyCouponDto) {
    const coupon = await this.repo.findOne({ where: { code: dto.code.toUpperCase(), isActive: true } });
    if (!coupon) throw new NotFoundError('Coupon');

    const now = new Date();
    if (coupon.startsAt && now < coupon.startsAt) throw new ValidationError('Coupon not yet valid');
    if (coupon.expiresAt && now > coupon.expiresAt) throw new ValidationError('Coupon has expired');
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new ValidationError('Coupon usage limit reached');
    if (coupon.minOrderAmount && dto.orderAmount < Number(coupon.minOrderAmount)) {
      throw new ValidationError(`Minimum order amount is ${coupon.minOrderAmount}`);
    }

    let discount = 0;
    if (coupon.type === 'percent') {
      discount = (dto.orderAmount * Number(coupon.value)) / 100;
      if (coupon.maxDiscountAmount) discount = Math.min(discount, Number(coupon.maxDiscountAmount));
    } else if (coupon.type === 'fixed') {
      discount = Math.min(Number(coupon.value), dto.orderAmount);
    } else if (coupon.type === 'free_shipping') {
      discount = 0; // Applied at order level
    }

    return { coupon, discount, finalAmount: dto.orderAmount - discount };
  }
}
