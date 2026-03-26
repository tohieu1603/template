import { IsUUID, IsString, IsOptional } from 'class-validator';

export class AvailabilityQueryDto {
  @IsUUID()
  serviceId: string;

  @IsUUID()
  providerId: string;

  @IsString()
  date: string;
}
