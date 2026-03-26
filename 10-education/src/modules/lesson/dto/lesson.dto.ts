import { IsString, IsOptional, IsBoolean, IsNumber, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateLessonDto {
  @IsString()
  sectionId: string;

  @IsString()
  courseId: string;

  @IsString()
  title: string;

  @IsOptional() @IsIn(['video', 'article', 'quiz', 'assignment'])
  contentType?: string;

  @IsOptional() @IsString()
  content?: string;

  @IsOptional() @IsString()
  videoUrl?: string;

  @IsOptional() @Type(() => Number) @IsNumber()
  videoDurationSeconds?: number;

  @IsOptional() @IsBoolean()
  isFreePreview?: boolean;

  @IsOptional() @Type(() => Number) @IsNumber()
  sortOrder?: number;
}

export class UpdateLessonDto {
  @IsOptional() @IsString()
  sectionId?: string;

  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsIn(['video', 'article', 'quiz', 'assignment'])
  contentType?: string;

  @IsOptional() @IsString()
  content?: string;

  @IsOptional() @IsString()
  videoUrl?: string;

  @IsOptional() @Type(() => Number) @IsNumber()
  videoDurationSeconds?: number;

  @IsOptional() @IsBoolean()
  isFreePreview?: boolean;

  @IsOptional() @Type(() => Number) @IsNumber()
  sortOrder?: number;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

export class LessonQueryDto extends PaginationQueryDto {
  @IsOptional() @IsString()
  courseId?: string;

  @IsOptional() @IsString()
  sectionId?: string;
}
