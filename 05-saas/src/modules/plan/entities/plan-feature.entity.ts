import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('plan_features')
export class PlanFeature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'plan_id', type: 'uuid' })
  @Index()
  planId: string;

  @Column({ name: 'feature_key' })
  featureKey: string;

  @Column({ name: 'feature_name' })
  featureName: string;

  @Column()
  value: string;

  @Column({ name: 'value_type', default: 'string' })
  valueType: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
