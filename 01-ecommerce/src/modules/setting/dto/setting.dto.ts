import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateSettingDto {
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

export class UpdateSettingDto {
  @IsString()
  value: string;
}

export class BulkUpdateSettingDto {
  settings: { key: string; value: string }[];
}

export class SettingQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  group?: string;
}
