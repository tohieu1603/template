import { AppDataSource } from '../../config/database.config';
import { ProviderService as ProviderServiceEntity } from './entities/provider-service.entity';
import { NotFoundError } from '../../common/errors/app-error';

export class ProviderServiceService {
  private repo = AppDataSource.getRepository(ProviderServiceEntity);

  async getServicesForProvider(providerId: string): Promise<any[]> {
    const result = await AppDataSource.query(
      `SELECT ps.service_id, s.name, s.slug, s.duration_minutes, s.price, s.is_active
       FROM provider_services ps
       JOIN services s ON s.id = ps.service_id
       WHERE ps.provider_id = $1
       ORDER BY s.name`,
      [providerId],
    );
    return result;
  }

  async getProvidersForService(serviceId: string): Promise<any[]> {
    const result = await AppDataSource.query(
      `SELECT ps.provider_id, p.name, p.slug, p.title, p.avatar_url, p.is_active
       FROM provider_services ps
       JOIN providers p ON p.id = ps.provider_id
       WHERE ps.service_id = $1
       ORDER BY p.name`,
      [serviceId],
    );
    return result;
  }

  async assign(providerId: string, serviceId: string): Promise<void> {
    await AppDataSource.query(
      `INSERT INTO provider_services (provider_id, service_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [providerId, serviceId],
    );
  }

  async remove(providerId: string, serviceId: string): Promise<void> {
    await AppDataSource.query(
      `DELETE FROM provider_services WHERE provider_id = $1 AND service_id = $2`,
      [providerId, serviceId],
    );
  }
}
