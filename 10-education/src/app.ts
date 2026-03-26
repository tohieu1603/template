import 'reflect-metadata';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import fs from 'fs';

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
import instructorRoutes from './modules/instructor/instructor.routes';
import courseCategoryRoutes from './modules/course-category/course-category.routes';
import courseRoutes from './modules/course/course.routes';
import courseSectionRoutes from './modules/course-section/course-section.routes';
import lessonRoutes from './modules/lesson/lesson.routes';
import quizRoutes from './modules/quiz/quiz.routes';
import enrollmentRoutes from './modules/enrollment/enrollment.routes';
import lessonProgressRoutes from './modules/lesson-progress/lesson-progress.routes';
import certificateRoutes from './modules/certificate/certificate.routes';
import paymentRoutes from './modules/payment/payment.routes';
import couponRoutes from './modules/coupon/coupon.routes';
import reviewRoutes from './modules/review/review.routes';

export function createApp(): Application {
  const app = express();

  // Ensure upload/log dirs exist
  if (!fs.existsSync(env.UPLOAD_DIR)) fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
  if (!fs.existsSync(env.LOG_DIR)) fs.mkdirSync(env.LOG_DIR, { recursive: true });

  // Security middleware
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

  // Performance
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

  // Static files
  app.use('/uploads', express.static(env.UPLOAD_DIR));

  // Swagger docs
  app.use(`${env.API_PREFIX}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'Education LMS API Docs',
  }));

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ success: true, message: 'Education LMS API is running', timestamp: new Date().toISOString(), environment: env.NODE_ENV });
  });

  // API routes
  const prefix = env.API_PREFIX;
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
  app.use(`${prefix}/instructors`, instructorRoutes);
  app.use(`${prefix}/course-categories`, courseCategoryRoutes);
  app.use(`${prefix}/courses`, courseRoutes);
  app.use(`${prefix}/course-sections`, courseSectionRoutes);
  app.use(`${prefix}/lessons`, lessonRoutes);
  app.use(`${prefix}/quizzes`, quizRoutes);
  app.use(`${prefix}/enrollments`, enrollmentRoutes);
  app.use(`${prefix}/lesson-progress`, lessonProgressRoutes);
  app.use(`${prefix}/certificates`, certificateRoutes);
  app.use(`${prefix}/payments`, paymentRoutes);
  app.use(`${prefix}/coupons`, couponRoutes);
  app.use(`${prefix}/reviews`, reviewRoutes);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });

  // Global error handler
  app.use(errorHandlerMiddleware);

  return app;
}
