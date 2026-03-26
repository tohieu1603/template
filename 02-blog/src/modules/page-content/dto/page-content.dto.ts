import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreatePageContentDto {
  @IsString()
  pageSlug: string;

  @IsString()
  pageName: string;

  content: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePageContentDto {
  @IsOptional()
  @IsString()
  pageName?: string;

  @IsOptional()
  content?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class PageContentQueryDto extends PaginationQueryDto {}
