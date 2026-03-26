import { IsString, IsOptional, IsIn, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateSettingDto {
  @IsString()
  key: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsIn(['string', 'number', 'boolean', 'json'])
  type?: string;

  @IsOptional()
  @IsString()
  groupName?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateSettingDto {
  @IsString()
  value: string;
}

export class BulkSettingItemDto {
  @IsString()
  key: string;

  @IsString()
  value: string;
}

export class BulkUpdateSettingDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkSettingItemDto)
  settings: BulkSettingItemDto[];
}

export class SettingQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  group?: string;
}
