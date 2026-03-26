import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateCourseDto {
  @IsString()
  instructorId: string;

  @IsString()
  categoryId: string;

  @IsString()
  title: string;

  @IsOptional() @IsIn(['draft', 'published', 'archived'])
  status?: string;

  @IsOptional() @IsString()
  subtitle?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  shortDescription?: string;

  @IsOptional() @IsString()
  thumbnailUrl?: string;

  @IsOptional() @IsString()
  previewVideoUrl?: string;

  @IsOptional() @IsIn(['beginner', 'intermediate', 'advanced', 'all'])
  level?: string;

  @IsOptional() @IsString()
  language?: string;

  @IsOptional() @Type(() => Number) @IsNumber()
  price?: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  compareAtPrice?: number;

  @IsOptional() @IsString()
  currency?: string;

  @IsOptional() @IsBoolean()
  isFree?: boolean;

  @IsOptional() @IsArray()
  requirements?: string[];

  @IsOptional() @IsArray()
  whatYouLearn?: string[];

  @IsOptional() @IsString()
  metaTitle?: string;

  @IsOptional() @IsString()
  metaDescription?: string;
}

export class UpdateCourseDto {
  @IsOptional() @IsString()
  categoryId?: string;

  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsString()
  subtitle?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  shortDescription?: string;

  @IsOptional() @IsString()
  thumbnailUrl?: string;

  @IsOptional() @IsString()
  previewVideoUrl?: string;

  @IsOptional() @IsIn(['beginner', 'intermediate', 'advanced', 'all'])
  level?: string;

  @IsOptional() @IsString()
  language?: string;

  @IsOptional() @Type(() => Number) @IsNumber()
  price?: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  compareAtPrice?: number;

  @IsOptional() @IsBoolean()
  isFree?: boolean;

  @IsOptional() @IsBoolean()
  isFeatured?: boolean;

  @IsOptional() @IsBoolean()
  isBestseller?: boolean;

  @IsOptional() @IsArray()
  requirements?: string[];

  @IsOptional() @IsArray()
  whatYouLearn?: string[];

  @IsOptional() @IsString()
  metaTitle?: string;

  @IsOptional() @IsString()
  metaDescription?: string;
}

export class CourseQueryDto extends PaginationQueryDto {
  @IsOptional() @IsString()
  categoryId?: string;

  @IsOptional() @IsString()
  instructorId?: string;

  @IsOptional() @IsString()
  level?: string;

  @IsOptional() @IsString()
  status?: string;

  @IsOptional() @IsString()
  isFree?: string;

  @IsOptional() @IsString()
  isFeatured?: string;

  @IsOptional() @Type(() => Number) @IsNumber()
  minPrice?: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  maxPrice?: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  minRating?: number;
}
