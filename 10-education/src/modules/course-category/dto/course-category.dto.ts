import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateCourseCategoryDto {
  @IsOptional() @IsString()
  parentId?: string;

  @IsString()
  name: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  imageUrl?: string;

  @IsOptional() @Type(() => Number) @IsNumber()
  sortOrder?: number;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

export class UpdateCourseCategoryDto {
  @IsOptional() @IsString()
  parentId?: string;

  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  imageUrl?: string;

  @IsOptional() @Type(() => Number) @IsNumber()
  sortOrder?: number;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

export class CourseCategoryQueryDto extends PaginationQueryDto {
  @IsOptional() @IsString()
  parentId?: string;
}
