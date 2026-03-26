import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('organization_features')
export class OrganizationFeature {
  @PrimaryColumn({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @PrimaryColumn({ name: 'feature_id', type: 'uuid' })
  featureId: string;

  @Column({ name: 'is_enabled', default: true })
  isEnabled: boolean;

  @Column({ name: 'enabled_at', type: 'timestamptz', nullable: true })
  enabledAt: Date;
}
