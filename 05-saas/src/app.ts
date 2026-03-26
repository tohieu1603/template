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

// Common module routes
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

// SaaS domain module routes
import organizationRoutes from './modules/organization/organization.routes';
import memberRoutes from './modules/member/member.routes';
import invitationRoutes from './modules/invitation/invitation.routes';
import planRoutes from './modules/plan/plan.routes';
import subscriptionRoutes from './modules/subscription/subscription.routes';
import invoiceRoutes from './modules/invoice/invoice.routes';
import paymentMethodRoutes from './modules/payment-method/payment-method.routes';
import usageRoutes from './modules/usage/usage.routes';
import apiKeyRoutes from './modules/api-key/api-key.routes';
import featureRoutes from './modules/feature/feature.routes';
import projectRoutes from './modules/project/project.routes';
import webhookRoutes from './modules/webhook/webhook.routes';

export function createApp(): Application {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

  // Performance middleware
  app.use(compression());

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      message: { success: false, message: 'Too many requests, please try again later' },
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

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
    customSiteTitle: 'SaaS API Docs',
  }));

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'API is running',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    });
  });

  const prefix = env.API_PREFIX;

  // Common routes
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

  // SaaS domain routes
  app.use(`${prefix}/organizations`, organizationRoutes);
  app.use(`${prefix}/organizations/:orgId/members`, memberRoutes);
  app.use(`${prefix}/organizations/:orgId/invitations`, invitationRoutes);
  app.use(`${prefix}/organizations/:orgId/subscriptions`, subscriptionRoutes);
  app.use(`${prefix}/organizations/:orgId/invoices`, invoiceRoutes);
  app.use(`${prefix}/organizations/:orgId/payment-methods`, paymentMethodRoutes);
  app.use(`${prefix}/organizations/:orgId/usage`, usageRoutes);
  app.use(`${prefix}/organizations/:orgId/api-keys`, apiKeyRoutes);
  app.use(`${prefix}/organizations/:orgId/projects`, projectRoutes);
  app.use(`${prefix}/organizations/:orgId/webhooks`, webhookRoutes);
  app.use(`${prefix}/plans`, planRoutes);
  app.use(`${prefix}/features`, featureRoutes);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });

  // Global error handler
  app.use(errorHandlerMiddleware);

  return app;
}
