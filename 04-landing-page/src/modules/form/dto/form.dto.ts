import { IsString, IsOptional, IsBoolean, IsArray, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateFormDto {
  @IsOptional()
  @IsUUID()
  pageId?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  fields: any[];

  @IsOptional()
  @IsString()
  submitButtonText?: string;

  @IsOptional()
  @IsString()
  successMessage?: string;

  @IsOptional()
  @IsString()
  redirectUrl?: string;

  @IsOptional()
  @IsString()
  notificationEmail?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateFormDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  fields?: any[];

  @IsOptional()
  @IsString()
  submitButtonText?: string;

  @IsOptional()
  @IsString()
  successMessage?: string;

  @IsOptional()
  @IsString()
  redirectUrl?: string;

  @IsOptional()
  @IsString()
  notificationEmail?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class FormQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  pageId?: string;
}
