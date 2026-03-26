import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('menu_item_options')
export class MenuItemOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'menu_item_id', type: 'uuid' })
  menuItemId: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', default: 'single' })
  type: string;

  @Column({ name: 'is_required', default: false })
  isRequired: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
