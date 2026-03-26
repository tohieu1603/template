import { IsIn } from 'class-validator';

export class UpdateOrderItemStatusDto {
  @IsIn(['preparing', 'ready', 'served', 'cancelled'])
  status: string;
}
