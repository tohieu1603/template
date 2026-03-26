import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('api_keys')
export class ApiKey extends BaseEntity {
  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId: string;

  @Column()
  name: string;

  @Column({ name: 'key_hash' })
  keyHash: string;

  @Column({ name: 'key_prefix' })
  keyPrefix: string;

  @Column({ type: 'text', array: true, nullable: true })
  scopes: string[];

  @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true })
  lastUsedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;
}
