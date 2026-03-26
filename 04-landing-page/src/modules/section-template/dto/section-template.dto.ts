import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateSectionTemplateDto {
  @IsString()
  name: string;

  @IsString()
  sectionType: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  defaultContent?: Record<string, any>;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sortOrder?: number;
}

export class UpdateSectionTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  sectionType?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  defaultContent?: Record<string, any>;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sortOrder?: number;
}

export class SectionTemplateQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  sectionType?: string;
}
