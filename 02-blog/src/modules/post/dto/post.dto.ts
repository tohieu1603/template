import { IsString, IsOptional, IsBoolean, IsNumber, IsUUID, IsArray, IsIn, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreatePostDto {
  @IsUUID()
  authorId: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  seriesId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  seriesOrder?: number;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  contentBlocks?: any;

  @IsOptional()
  contentStructure?: any;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  status?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsBoolean()
  allowComments?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readingTime?: number;

  @IsOptional()
  @IsBoolean()
  isEvergreen?: boolean;

  @IsOptional()
  @IsString()
  template?: string;

  @IsOptional()
  customFields?: any;

  @IsOptional()
  @IsArray()
  faq?: any[];

  // SEO fields
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  metaKeywords?: string;

  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @IsOptional()
  @IsString()
  ogTitle?: string;

  @IsOptional()
  @IsString()
  ogDescription?: string;

  @IsOptional()
  @IsString()
  ogImage?: string;

  @IsOptional()
  @IsString()
  twitterTitle?: string;

  @IsOptional()
  @IsString()
  twitterDescription?: string;

  @IsOptional()
  @IsString()
  twitterImage?: string;

  @IsOptional()
  @IsString()
  robots?: string;

  @IsOptional()
  @IsString()
  newsKeywords?: string;

  // Tag IDs to attach
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  tagIds?: string[];
}

export class UpdatePostDto {
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  seriesId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  seriesOrder?: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  contentBlocks?: any;

  @IsOptional()
  contentStructure?: any;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  status?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsBoolean()
  allowComments?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readingTime?: number;

  @IsOptional()
  @IsBoolean()
  isEvergreen?: boolean;

  @IsOptional()
  @IsString()
  template?: string;

  @IsOptional()
  customFields?: any;

  @IsOptional()
  @IsArray()
  faq?: any[];

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  metaKeywords?: string;

  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @IsOptional()
  @IsString()
  ogTitle?: string;

  @IsOptional()
  @IsString()
  ogDescription?: string;

  @IsOptional()
  @IsString()
  ogImage?: string;

  @IsOptional()
  @IsString()
  twitterTitle?: string;

  @IsOptional()
  @IsString()
  twitterDescription?: string;

  @IsOptional()
  @IsString()
  twitterImage?: string;

  @IsOptional()
  @IsString()
  robots?: string;

  @IsOptional()
  @IsString()
  newsKeywords?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  tagIds?: string[];

  // For revision tracking
  @IsOptional()
  @IsString()
  revisionNote?: string;
}

export class PostQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  status?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  authorId?: string;

  @IsOptional()
  @IsUUID()
  seriesId?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString()
  isFeatured?: string;

  @IsOptional()
  @IsString()
  isTrending?: string;

  @IsOptional()
  @IsString()
  isPinned?: string;
}
