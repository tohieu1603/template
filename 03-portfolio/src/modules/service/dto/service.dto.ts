import { IsString, IsOptional, IsBoolean, IsNumber, IsUUID, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateServiceDto {
  @IsOptional()
  @IsUUID()
  profileId?: string;

  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsIn(['fixed', 'hourly', 'project', 'contact'])
  priceType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceFrom?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceTo?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sortOrder?: number;
}

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsIn(['fixed', 'hourly', 'project', 'contact'])
  priceType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceFrom?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceTo?: number;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sortOrder?: number;
}

export class ServiceQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  profileId?: string;

  @IsOptional()
  @IsString()
  isActive?: string;

  @IsOptional()
  @IsString()
  isFeatured?: string;
}
