import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateBannerDto {
  @IsString()
  title: string;

  @IsOptional() @IsString()
  subtitle?: string;

  @IsString()
  imageUrl: string;

  @IsOptional() @IsString()
  linkUrl?: string;

  @IsOptional() @IsString()
  buttonText?: string;

  @IsOptional() @Type(() => Number) @IsNumber()
  sortOrder?: number;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

export class UpdateBannerDto {
  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsString()
  subtitle?: string;

  @IsOptional() @IsString()
  imageUrl?: string;

  @IsOptional() @IsString()
  linkUrl?: string;

  @IsOptional() @IsString()
  buttonText?: string;

  @IsOptional() @Type(() => Number) @IsNumber()
  sortOrder?: number;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

export class BannerQueryDto extends PaginationQueryDto {}
