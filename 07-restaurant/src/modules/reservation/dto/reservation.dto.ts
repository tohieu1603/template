import { IsString, IsOptional, IsInt, Min, IsUUID, IsDateString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateReservationDto {
  @IsString()
  customerName: string;

  @IsString()
  customerPhone: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @IsUUID()
  tableId?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  partySize: number;

  @IsString()
  reservationDate: string;

  @IsString()
  reservationTime: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(30)
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  specialRequests?: string;
}

export class UpdateReservationDto {
  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @IsUUID()
  tableId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  partySize?: number;

  @IsOptional()
  @IsString()
  reservationDate?: string;

  @IsOptional()
  @IsString()
  reservationTime?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(30)
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  specialRequests?: string;
}

export class CancelReservationDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ReservationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsUUID()
  tableId?: string;
}
