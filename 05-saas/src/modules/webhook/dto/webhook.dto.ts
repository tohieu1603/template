import { IsString, IsArray, IsOptional, IsBoolean, IsUrl } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateWebhookDto {
  @IsUrl()
  url: string;

  @IsArray()
  @IsString({ each: true })
  events: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateWebhookDto {
  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  events?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class WebhookQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  isActive?: string;
}

export class WebhookLogQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  success?: string;
}
