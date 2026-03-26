import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, IsDateString, Min, IsPositive } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsEnum(['percent', 'fixed', 'free_shipping'])
  type: 'percent' | 'fixed' | 'free_shipping';

  @Min(0)
  @IsNumber()
  value: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @IsOptional()
  @IsNumber()
  usageLimit?: number;

  @IsOptional()
  @IsNumber()
  usagePerUser?: number;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCouponDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class ApplyCouponDto {
  @IsString()
  code: string;

  @IsPositive()
  @IsNumber()
  orderAmount: number;
}

export class CouponQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  status?: string;
}
