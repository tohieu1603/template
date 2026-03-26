import { IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateBookingDto {
  @IsUUID()
  serviceId: string;

  @IsUUID()
  providerId: string;

  @IsString()
  bookingDate: string;

  @IsString()
  startTime: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CancelBookingDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateBookingAdminNoteDto {
  @IsOptional()
  @IsString()
  adminNote?: string;
}

export class BookingQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  providerId?: string;

  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  date?: string;
}
