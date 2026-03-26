import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;  // e.g. 'products.create'

  @Column({ name: 'display_name' })
  displayName: string;

  @Column({ name: 'group_name' })
  groupName: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
