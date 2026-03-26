import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('tables')
export class RestaurantTable extends BaseEntity {
  @Column({ name: 'table_number', unique: true })
  tableNumber: string;

  @Column({ nullable: true })
  zone: string;

  @Column()
  capacity: number;

  @Column({ type: 'varchar', default: 'available' })
  status: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
