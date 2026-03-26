import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('operating_hours')
@Index(['dayOfWeek'], { unique: true })
export class OperatingHours extends BaseEntity {
  @Column({ name: 'day_of_week' })
  dayOfWeek: number;

  @Column({ name: 'open_time', type: 'time' })
  openTime: string;

  @Column({ name: 'close_time', type: 'time' })
  closeTime: string;

  @Column({ name: 'is_closed', default: false })
  isClosed: boolean;

  @Column({ name: 'special_note', nullable: true })
  specialNote: string;
}
