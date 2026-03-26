import { Entity, PrimaryColumn } from 'typeorm';

@Entity('provider_services')
export class ProviderService {
  @PrimaryColumn({ name: 'provider_id', type: 'uuid' })
  providerId: string;

  @PrimaryColumn({ name: 'service_id', type: 'uuid' })
  serviceId: string;
}
