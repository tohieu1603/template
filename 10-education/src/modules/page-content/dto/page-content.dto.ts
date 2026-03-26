import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreatePageContentDto {
  @IsString()
  slug: string;

  @IsString()
  title: string;

  @IsOptional() @IsString()
  content?: string;

  @IsOptional() @IsString()
  metaTitle?: string;

  @IsOptional() @IsString()
  metaDescription?: string;

  @IsOptional() @IsBoolean()
  isPublished?: boolean;
}

export class UpdatePageContentDto {
  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsString()
  content?: string;

  @IsOptional() @IsString()
  metaTitle?: string;

  @IsOptional() @IsString()
  metaDescription?: string;

  @IsOptional() @IsBoolean()
  isPublished?: boolean;
}

export class PageContentQueryDto extends PaginationQueryDto {}
