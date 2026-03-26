import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('certifications')
export class Certification extends BaseEntity {
  @Column({ name: 'profile_id', type: 'uuid' })
  @Index()
  profileId: string;

  @Column()
  name: string;

  @Column()
  issuer: string;

  @Column({ name: 'issue_date', type: 'timestamptz', nullable: true })
  issueDate: Date;

  @Column({ name: 'expiry_date', type: 'timestamptz', nullable: true })
  expiryDate: Date;

  @Column({ name: 'credential_id', nullable: true })
  credentialId: string;

  @Column({ name: 'credential_url', nullable: true })
  credentialUrl: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;
}
