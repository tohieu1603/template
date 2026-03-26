import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ name: 'menu_item_id', type: 'uuid' })
  menuItemId: string;

  @Column({ name: 'item_name' })
  itemName: string;

  @Column({ name: 'item_price', type: 'decimal', precision: 15, scale: 2 })
  itemPrice: number;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  subtotal: number;

  @Column({ type: 'jsonb', nullable: true })
  options: any[];

  @Column({ name: 'special_instructions', nullable: true, type: 'text' })
  specialInstructions: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
