import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('attribute_values')
export class AttributeValue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'attribute_id', type: 'uuid' })
  @Index()
  attributeId: string;

  @Column()
  value: string;

  @Column({ name: 'color_hex', nullable: true })
  colorHex: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
