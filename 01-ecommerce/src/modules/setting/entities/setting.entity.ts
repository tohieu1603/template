import { Entity, Column, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export type SettingType = 'string' | 'number' | 'boolean' | 'json';

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ type: 'enum', enum: ['string', 'number', 'boolean', 'json'], default: 'string' })
  type: SettingType;

  @Column({ name: 'group_name', nullable: true })
  groupName: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
