import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;

  @Column({ type: 'text', nullable: true })
  value: string;

  @Column({ default: 'string' })
  type: string;

  @Column({ name: 'group_name', nullable: true })
  groupName: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
