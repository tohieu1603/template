import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateHolidayDto {
  @IsString()
  name: string;

  @IsString()
  date: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;
}

export class UpdateHolidayDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;
}

export class HolidayQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  year?: string;
}
