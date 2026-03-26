import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('reservations')
export class Reservation extends BaseEntity {
  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId: string;

  @Column({ name: 'customer_name' })
  customerName: string;

  @Column({ name: 'customer_phone' })
  customerPhone: string;

  @Column({ name: 'customer_email', nullable: true })
  customerEmail: string;

  @Column({ name: 'table_id', type: 'uuid', nullable: true })
  tableId: string;

  @Column({ name: 'party_size' })
  partySize: number;

  @Column({ name: 'reservation_date', type: 'date' })
  reservationDate: string;

  @Column({ name: 'reservation_time', type: 'time' })
  reservationTime: string;

  @Column({ name: 'duration_minutes', default: 120 })
  durationMinutes: number;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ name: 'special_requests', nullable: true, type: 'text' })
  specialRequests: string;

  @Column({ name: 'confirmed_at', type: 'timestamptz', nullable: true })
  confirmedAt: Date;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt: Date;

  @Column({ name: 'cancel_reason', nullable: true })
  cancelReason: string;
}
