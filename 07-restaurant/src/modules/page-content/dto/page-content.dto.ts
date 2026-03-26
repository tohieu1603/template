import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreatePageContentDto {
  @IsString()
  pageSlug: string;

  @IsString()
  pageName: string;

  @IsObject()
  content: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;
}

export class UpdatePageContentDto {
  @IsOptional()
  @IsString()
  pageName?: string;

  @IsOptional()
  @IsObject()
  content?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;
}

export class PageContentQueryDto extends PaginationQueryDto {}
