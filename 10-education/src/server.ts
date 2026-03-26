import 'reflect-metadata';
import { createApp } from './app';
import { initializeDatabase } from './config/database.config';
import { env } from './config/env.config';
import { logger } from './common/utils/logger';

async function bootstrap(): Promise<void> {
  try {
    logger.info('Connecting to database...');
    await initializeDatabase();
    logger.info('Database connected successfully');

    const app = createApp();

    app.listen(env.PORT, () => {
      logger.info(`Education LMS API running on port ${env.PORT}`);
      logger.info(`Environment: ${env.NODE_ENV}`);
      logger.info(`API Prefix: ${env.API_PREFIX}`);
      logger.info(`Docs: http://localhost:${env.PORT}${env.API_PREFIX}/docs`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

bootstrap();
