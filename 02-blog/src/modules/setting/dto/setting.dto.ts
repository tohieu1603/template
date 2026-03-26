import { IsString, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class UpsertSettingDto {
  @IsString()
  key: string;

  @IsString()
  value: string;

  @IsEnum(['string', 'number', 'boolean', 'json'])
  type: 'string' | 'number' | 'boolean' | 'json';

  @IsOptional()
  @IsString()
  groupName?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class BulkUpsertSettingDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkSettingItemDto)
  settings: BulkSettingItemDto[];
}

export class BulkSettingItemDto {
  @IsString()
  key: string;

  @IsString()
  value: string;
}

export class SettingQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  group?: string;
}
