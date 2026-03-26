import { IsString, IsOptional, IsBoolean, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateTableDto {
  @IsString()
  tableNumber: string;

  @IsOptional()
  @IsIn(['indoor', 'outdoor', 'vip', 'bar'])
  zone?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTableDto {
  @IsOptional()
  @IsString()
  tableNumber?: string;

  @IsOptional()
  @IsIn(['indoor', 'outdoor', 'vip', 'bar'])
  zone?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTableStatusDto {
  @IsIn(['available', 'occupied', 'reserved', 'maintenance'])
  status: string;
}

export class TableQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  zone?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
