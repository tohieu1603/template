import 'reflect-metadata';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.config';
import { swaggerSpec } from './config/swagger.config';
import { requestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { errorHandlerMiddleware } from './common/middleware/error-handler.middleware';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import roleRoutes from './modules/role/role.routes';
import settingRoutes from './modules/setting/setting.routes';
import mediaRoutes from './modules/media/media.routes';
import pageContentRoutes from './modules/page-content/page-content.routes';
import contactRoutes from './modules/contact/contact.routes';
import activityLogRoutes from './modules/activity-log/activity-log.routes';
import notificationRoutes from './modules/notification/notification.routes';
import bannerRoutes from './modules/banner/banner.routes';
import profileRoutes from './modules/profile/profile.routes';
import experienceRoutes from './modules/experience/experience.routes';
import skillRoutes from './modules/skill/skill.routes';
import certificationRoutes from './modules/certification/certification.routes';
import projectCategoryRoutes from './modules/project-category/project-category.routes';
import technologyRoutes from './modules/technology/technology.routes';
import projectRoutes from './modules/project/project.routes';
import serviceRoutes from './modules/service/service.routes';
import testimonialRoutes from './modules/testimonial/testimonial.routes';
import blogRoutes from './modules/blog/blog.routes';

export function createApp(): Application {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

  // Performance middleware
  app.use(compression());

  // Rate limiting
  app.use(rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    message: { success: false, message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
  }));

  // Request parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use(requestLoggerMiddleware);

  // Serve uploaded files
  app.use('/uploads', express.static(env.UPLOAD_DIR));

  // Swagger documentation
  app.use(`${env.API_PREFIX}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'Portfolio API Docs',
  }));

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString(), environment: env.NODE_ENV });
  });

  // API routes
  const prefix = env.API_PREFIX;

  // Common modules
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/users`, userRoutes);
  app.use(`${prefix}/roles`, roleRoutes);
  app.use(`${prefix}/settings`, settingRoutes);
  app.use(`${prefix}/media`, mediaRoutes);
  app.use(`${prefix}/pages`, pageContentRoutes);
  app.use(`${prefix}/contacts`, contactRoutes);
  app.use(`${prefix}/activity-logs`, activityLogRoutes);
  app.use(`${prefix}/notifications`, notificationRoutes);
  app.use(`${prefix}/banners`, bannerRoutes);

  // Portfolio domain modules
  app.use(`${prefix}/profiles`, profileRoutes);
  app.use(`${prefix}/experiences`, experienceRoutes);
  app.use(`${prefix}/skills`, skillRoutes);
  app.use(`${prefix}/certifications`, certificationRoutes);
  app.use(`${prefix}/project-categories`, projectCategoryRoutes);
  app.use(`${prefix}/technologies`, technologyRoutes);
  app.use(`${prefix}/projects`, projectRoutes);
  app.use(`${prefix}/services`, serviceRoutes);
  app.use(`${prefix}/testimonials`, testimonialRoutes);
  app.use(`${prefix}/blog`, blogRoutes);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });

  // Global error handler
  app.use(errorHandlerMiddleware);

  return app;
}
