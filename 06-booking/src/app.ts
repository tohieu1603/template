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

// Route imports — Common
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

// Route imports — Booking Domain
import serviceCategoryRoutes from './modules/service-category/service-category.routes';
import serviceRoutes from './modules/service/service.routes';
import providerRoutes from './modules/provider/provider.routes';
import providerServiceRoutes from './modules/provider-service/provider-service.routes';
import bookingRoutes from './modules/booking/booking.routes';
import availabilityRoutes from './modules/availability/availability.routes';
import customerProfileRoutes from './modules/customer-profile/customer-profile.routes';
import paymentRoutes from './modules/payment/payment.routes';
import reviewRoutes from './modules/review/review.routes';
import holidayRoutes from './modules/holiday/holiday.routes';
import blockedSlotRoutes from './modules/blocked-slot/blocked-slot.routes';

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
    customSiteTitle: 'Booking API Docs',
  }));

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Booking API is running',
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

  // Booking domain routes
  app.use(`${prefix}/service-categories`, serviceCategoryRoutes);
  app.use(`${prefix}/services`, serviceRoutes);
  app.use(`${prefix}/providers`, providerRoutes);
  app.use(`${prefix}/provider-services`, providerServiceRoutes);
  app.use(`${prefix}/bookings`, bookingRoutes);
  app.use(`${prefix}/availability`, availabilityRoutes);
  app.use(`${prefix}/customer-profiles`, customerProfileRoutes);
  app.use(`${prefix}/payments`, paymentRoutes);
  app.use(`${prefix}/reviews`, reviewRoutes);
  app.use(`${prefix}/holidays`, holidayRoutes);
  app.use(`${prefix}/blocked-slots`, blockedSlotRoutes);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });

  // Global error handler (must be last)
  app.use(errorHandlerMiddleware);

  return app;
}
