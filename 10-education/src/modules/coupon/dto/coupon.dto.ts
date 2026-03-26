import { IsString, IsOptional, IsBoolean, IsNumber, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsIn(['percent', 'fixed'])
  type: string;

  @Type(() => Number) @IsNumber() @Min(0)
  value: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  minCoursePrice?: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  maxDiscount?: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  usageLimit?: number;

  @IsOptional() @IsString()
  courseId?: string;

  @IsString()
  startsAt: string;

  @IsString()
  expiresAt: string;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

export class UpdateCouponDto {
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  value?: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  minCoursePrice?: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  maxDiscount?: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  usageLimit?: number;

  @IsOptional() @IsString()
  startsAt?: string;

  @IsOptional() @IsString()
  expiresAt?: string;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

export class ApplyCouponDto {
  @IsString()
  code: string;

  @IsString()
  courseId: string;
}

export class CouponQueryDto extends PaginationQueryDto {
  @IsOptional() @IsString()
  isActive?: string;
}
