import { IsString, IsOptional, IsBoolean, IsNumber, IsUUID, IsEmail, IsArray, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateAuthorDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  shortBio?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  expertise?: string[];

  @IsOptional()
  @IsArray()
  experience?: any[];

  @IsOptional()
  @IsArray()
  education?: any[];

  @IsOptional()
  @IsArray()
  certifications?: any[];

  @IsOptional()
  @IsArray()
  achievements?: any[];

  @IsOptional()
  @IsArray()
  skills?: any[];

  @IsOptional()
  @IsArray()
  publications?: any[];

  @IsOptional()
  @IsArray()
  articles?: any[];

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  socialTwitter?: string;

  @IsOptional()
  @IsString()
  socialLinkedin?: string;

  @IsOptional()
  @IsString()
  socialFacebook?: string;

  @IsOptional()
  @IsString()
  socialGithub?: string;

  @IsOptional()
  @IsString()
  socialYoutube?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sameAs?: string[];

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sortOrder?: number;
}

export class UpdateAuthorDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  shortBio?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  expertise?: string[];

  @IsOptional()
  @IsArray()
  experience?: any[];

  @IsOptional()
  @IsArray()
  education?: any[];

  @IsOptional()
  @IsArray()
  certifications?: any[];

  @IsOptional()
  @IsArray()
  achievements?: any[];

  @IsOptional()
  @IsArray()
  skills?: any[];

  @IsOptional()
  @IsArray()
  publications?: any[];

  @IsOptional()
  @IsArray()
  articles?: any[];

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  socialTwitter?: string;

  @IsOptional()
  @IsString()
  socialLinkedin?: string;

  @IsOptional()
  @IsString()
  socialFacebook?: string;

  @IsOptional()
  @IsString()
  socialGithub?: string;

  @IsOptional()
  @IsString()
  socialYoutube?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sameAs?: string[];

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sortOrder?: number;
}

export class AuthorQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  featured?: string;
}
