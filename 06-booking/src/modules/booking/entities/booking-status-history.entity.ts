import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('booking_status_history')
export class BookingStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @Column({ name: 'from_status', nullable: true })
  fromStatus: string;

  @Column({ name: 'to_status' })
  toStatus: string;

  @Column({ nullable: true, type: 'text' })
  note: string;

  @Column({ name: 'changed_by', type: 'uuid', nullable: true })
  changedBy: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
