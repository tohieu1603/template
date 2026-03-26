import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('customer_profiles')
export class CustomerProfile extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true, type: 'text' })
  address: string;

  @Column({ name: 'medical_notes', nullable: true, type: 'text' })
  medicalNotes: string;

  @Column({ name: 'preferred_provider_id', type: 'uuid', nullable: true })
  preferredProviderId: string;

  @Column({ name: 'total_bookings', type: 'int', default: 0 })
  totalBookings: number;

  @Column({ name: 'total_spent', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalSpent: number;

  @Column({ name: 'last_visit_at', type: 'timestamptz', nullable: true })
  lastVisitAt: Date;
}
