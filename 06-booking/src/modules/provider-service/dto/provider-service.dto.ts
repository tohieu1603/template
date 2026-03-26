import { IsUUID } from 'class-validator';

export class AssignServiceDto {
  @IsUUID()
  serviceId: string;
}

export class RemoveServiceDto {
  @IsUUID()
  serviceId: string;
}
