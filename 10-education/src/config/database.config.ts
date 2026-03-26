import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from './env.config';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
  synchronize: env.DB_SYNC,
  logging: env.DB_LOGGING,
  entities: [
    __dirname + '/../modules/**/entities/*.entity{.ts,.js}',
    __dirname + '/../common/entities/*.entity{.ts,.js}',
  ],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  subscribers: [],
});

export async function initializeDatabase(): Promise<void> {
  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await AppDataSource.initialize();
      return;
    } catch (error) {
      attempt++;
      if (attempt === maxRetries) throw error;
      await new Promise((res) => setTimeout(res, 2000 * attempt));
    }
  }
}
