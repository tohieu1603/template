import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UpsertSettingDto {
  @IsString()
  key: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsEnum(['string', 'number', 'boolean', 'json'])
  type?: string;

  @IsOptional()
  @IsString()
  groupName?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class BulkUpsertSettingsDto {
  settings: UpsertSettingDto[];
}
