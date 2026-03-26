import { IsString, IsOptional, IsBoolean, IsEnum, IsInt, IsDateString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateBannerDto {
  @IsString()
  title: string;

  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsString()
  linkUrl?: string;

  @IsEnum(['hero', 'sidebar', 'popup'])
  position: 'hero' | 'sidebar' | 'popup';

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateBannerDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  linkUrl?: string;

  @IsOptional()
  @IsEnum(['hero', 'sidebar', 'popup'])
  position?: 'hero' | 'sidebar' | 'popup';

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class BannerQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
