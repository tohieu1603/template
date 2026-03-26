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
import menuCategoryRoutes from './modules/menu-category/menu-category.routes';
import menuItemRoutes from './modules/menu-item/menu-item.routes';
import tableRoutes from './modules/table/table.routes';
import reservationRoutes from './modules/reservation/reservation.routes';
import orderRoutes from './modules/order/order.routes';
import orderItemRoutes from './modules/order-item/order-item.routes';
import couponRoutes from './modules/coupon/coupon.routes';
import paymentRoutes from './modules/payment/payment.routes';
import reviewRoutes from './modules/review/review.routes';
import kitchenQueueRoutes from './modules/kitchen-queue/kitchen-queue.routes';
import operatingHoursRoutes from './modules/operating-hours/operating-hours.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(compression());
  app.use(rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    message: { success: false, message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(requestLoggerMiddleware);
  app.use('/uploads', express.static(env.UPLOAD_DIR));

  app.use(`${env.API_PREFIX}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'Restaurant API Docs',
  }));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString(), environment: env.NODE_ENV });
  });

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

  // Restaurant domain modules
  app.use(`${prefix}/menu-categories`, menuCategoryRoutes);
  app.use(`${prefix}/menu-items`, menuItemRoutes);
  app.use(`${prefix}/tables`, tableRoutes);
  app.use(`${prefix}/reservations`, reservationRoutes);
  app.use(`${prefix}/orders`, orderRoutes);
  app.use(`${prefix}/order-items`, orderItemRoutes);
  app.use(`${prefix}/coupons`, couponRoutes);
  app.use(`${prefix}/payments`, paymentRoutes);
  app.use(`${prefix}/reviews`, reviewRoutes);
  app.use(`${prefix}/kitchen-queue`, kitchenQueueRoutes);
  app.use(`${prefix}/operating-hours`, operatingHoursRoutes);
  app.use(`${prefix}/dashboard`, dashboardRoutes);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });

  app.use(errorHandlerMiddleware);

  return app;
}
