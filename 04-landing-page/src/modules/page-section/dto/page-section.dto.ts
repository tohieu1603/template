import { IsString, IsOptional, IsBoolean, IsNumber, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePageSectionDto {
  @IsUUID()
  pageId: string;

  @IsString()
  sectionType: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  content?: Record<string, any>;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @IsOptional()
  @IsString()
  backgroundImage?: string;

  @IsOptional()
  @IsString()
  cssClass?: string;
}

export class UpdatePageSectionDto {
  @IsOptional()
  @IsString()
  sectionType?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  content?: Record<string, any>;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @IsOptional()
  @IsString()
  backgroundImage?: string;

  @IsOptional()
  @IsString()
  cssClass?: string;
}

export class ReorderSectionsDto {
  orders: Array<{ id: string; sortOrder: number }>;
}
