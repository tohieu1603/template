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
import addressRoutes from './modules/address/address.routes';
import categoryRoutes from './modules/category/category.routes';
import brandRoutes from './modules/brand/brand.routes';
import attributeRoutes from './modules/attribute/attribute.routes';
import productRoutes from './modules/product/product.routes';
import cartRoutes from './modules/cart/cart.routes';
import orderRoutes from './modules/order/order.routes';
import paymentRoutes from './modules/payment/payment.routes';
import couponRoutes from './modules/coupon/coupon.routes';
import reviewRoutes from './modules/review/review.routes';
import wishlistRoutes from './modules/wishlist/wishlist.routes';
import bannerRoutes from './modules/banner/banner.routes';
import shippingMethodRoutes from './modules/shipping-method/shipping-method.routes';
import notificationRoutes from './modules/notification/notification.routes';
import settingRoutes from './modules/setting/setting.routes';
import mediaRoutes from './modules/media/media.routes';
import pageContentRoutes from './modules/page-content/page-content.routes';
import contactRoutes from './modules/contact/contact.routes';
import activityLogRoutes from './modules/activity-log/activity-log.routes';

/**
 * Express application factory.
 * Configures all middleware, routes, and error handling.
 */
export function createApp(): Application {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

  // Performance middleware
  app.use(compression());

  // Rate limiting (global)
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

  // Serve uploaded files statically
  app.use('/uploads', express.static(env.UPLOAD_DIR));

  // Swagger documentation
  app.use(`${env.API_PREFIX}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'E-commerce API Docs',
  }));

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'API is running',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    });
  });

  // API routes
  const prefix = env.API_PREFIX;
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/users`, userRoutes);
  app.use(`${prefix}/roles`, roleRoutes);
  app.use(`${prefix}/addresses`, addressRoutes);
  app.use(`${prefix}/categories`, categoryRoutes);
  app.use(`${prefix}/brands`, brandRoutes);
  app.use(`${prefix}/attributes`, attributeRoutes);
  app.use(`${prefix}/products`, productRoutes);
  app.use(`${prefix}/cart`, cartRoutes);
  app.use(`${prefix}/orders`, orderRoutes);
  app.use(`${prefix}/payments`, paymentRoutes);
  app.use(`${prefix}/coupons`, couponRoutes);
  app.use(`${prefix}/reviews`, reviewRoutes);
  app.use(`${prefix}/wishlist`, wishlistRoutes);
  app.use(`${prefix}/banners`, bannerRoutes);
  app.use(`${prefix}/shipping-methods`, shippingMethodRoutes);
  app.use(`${prefix}/notifications`, notificationRoutes);
  app.use(`${prefix}/settings`, settingRoutes);
  app.use(`${prefix}/media`, mediaRoutes);
  app.use(`${prefix}/pages`, pageContentRoutes);
  app.use(`${prefix}/contacts`, contactRoutes);
  app.use(`${prefix}/activity-logs`, activityLogRoutes);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });

  // Global error handler (must be last)
  app.use(errorHandlerMiddleware);

  return app;
}
