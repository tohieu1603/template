import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('menu_option_values')
export class MenuOptionValue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'option_id', type: 'uuid' })
  optionId: string;

  @Column()
  name: string;

  @Column({ name: 'price_modifier', type: 'decimal', precision: 15, scale: 2, default: 0 })
  priceModifier: number;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
