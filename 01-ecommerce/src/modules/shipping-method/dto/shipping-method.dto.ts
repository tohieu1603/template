import { IsString, IsOptional, IsBoolean, IsInt, IsNumber } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateShippingMethodDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  baseFee?: number;

  @IsOptional()
  @IsNumber()
  freeShipThreshold?: number;

  @IsOptional()
  @IsString()
  estimatedDays?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  config?: Record<string, any>;
}

export class UpdateShippingMethodDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  baseFee?: number;

  @IsOptional()
  @IsNumber()
  freeShipThreshold?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ShippingMethodQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  status?: string;
}
