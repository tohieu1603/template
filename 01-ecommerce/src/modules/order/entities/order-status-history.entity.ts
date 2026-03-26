import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('order_status_history')
export class OrderStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  @Index()
  orderId: string;

  @Column({ name: 'from_status', nullable: true })
  fromStatus: string;

  @Column({ name: 'to_status' })
  toStatus: string;

  @Column({ nullable: true, type: 'text' })
  note: string;

  @Column({ name: 'changed_by', nullable: true })
  changedBy: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
