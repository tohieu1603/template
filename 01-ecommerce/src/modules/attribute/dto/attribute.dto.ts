import { IsString, IsOptional, IsEnum, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAttributeValueDto {
  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  colorHex?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateAttributeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsEnum(['select', 'color', 'text'])
  type: 'select' | 'color' | 'text';

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttributeValueDto)
  values?: CreateAttributeValueDto[];
}

export class UpdateAttributeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['select', 'color', 'text'])
  type?: 'select' | 'color' | 'text';

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
