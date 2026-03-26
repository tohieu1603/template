import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('addresses')
export class Address extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({ nullable: true })
  label: string;  // e.g. 'Home', 'Office'

  @Column({ name: 'recipient_name' })
  recipientName: string;

  @Column()
  phone: string;

  @Column()
  province: string;

  @Column()
  district: string;

  @Column()
  ward: string;

  @Column({ name: 'street_address', type: 'text' })
  streetAddress: string;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;
}
