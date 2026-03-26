import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('order_status_history')
export class OrderStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

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
