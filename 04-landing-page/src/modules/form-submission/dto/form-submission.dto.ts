import { IsUUID, IsOptional, IsString, IsObject } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateFormSubmissionDto {
  @IsUUID()
  formId: string;

  @IsOptional()
  @IsUUID()
  pageId?: string;

  @IsObject()
  data: Record<string, any>;

  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @IsOptional()
  @IsString()
  utmSource?: string;

  @IsOptional()
  @IsString()
  utmMedium?: string;

  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @IsOptional()
  @IsString()
  utmTerm?: string;

  @IsOptional()
  @IsString()
  utmContent?: string;

  @IsOptional()
  @IsString()
  referrer?: string;
}

export class FormSubmissionQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  formId?: string;

  @IsOptional()
  @IsString()
  isRead?: string;
}
