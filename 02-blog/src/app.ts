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
import authorRoutes from './modules/author/author.routes';
import categoryRoutes from './modules/category/category.routes';
import tagRoutes from './modules/tag/tag.routes';
import seriesRoutes from './modules/series/series.routes';
import postRoutes from './modules/post/post.routes';
import commentRoutes from './modules/comment/comment.routes';
import reactionRoutes from './modules/reaction/reaction.routes';
import bookmarkRoutes from './modules/bookmark/bookmark.routes';
import bannerRoutes from './modules/banner/banner.routes';
import mediaRoutes from './modules/media/media.routes';
import contactRoutes from './modules/contact/contact.routes';
import notificationRoutes from './modules/notification/notification.routes';
import settingRoutes from './modules/setting/setting.routes';
import pageContentRoutes from './modules/page-content/page-content.routes';
import activityLogRoutes from './modules/activity-log/activity-log.routes';
import redirectRoutes from './modules/redirect/redirect.routes';
import newsletterRoutes from './modules/newsletter/newsletter.routes';

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
    customSiteTitle: 'Blog API Docs',
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
  app.use(`${prefix}/authors`, authorRoutes);
  app.use(`${prefix}/categories`, categoryRoutes);
  app.use(`${prefix}/tags`, tagRoutes);
  app.use(`${prefix}/series`, seriesRoutes);
  app.use(`${prefix}/posts`, postRoutes);
  app.use(`${prefix}/comments`, commentRoutes);
  app.use(`${prefix}/posts/:postId/reactions`, reactionRoutes);
  app.use(`${prefix}/bookmarks`, bookmarkRoutes);
  app.use(`${prefix}/banners`, bannerRoutes);
  app.use(`${prefix}/media`, mediaRoutes);
  app.use(`${prefix}/contacts`, contactRoutes);
  app.use(`${prefix}/notifications`, notificationRoutes);
  app.use(`${prefix}/settings`, settingRoutes);
  app.use(`${prefix}/pages`, pageContentRoutes);
  app.use(`${prefix}/activity-logs`, activityLogRoutes);
  app.use(`${prefix}/redirects`, redirectRoutes);
  app.use(`${prefix}/newsletter`, newsletterRoutes);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });

  // Global error handler (must be last)
  app.use(errorHandlerMiddleware);

  return app;
}
