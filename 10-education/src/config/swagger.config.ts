import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Education LMS API',
      version: '1.0.0',
      description: 'Education/LMS Backend API - Online courses, quizzes, enrollments, certificates',
    },
    servers: [{ url: `http://localhost:${env.PORT}${env.API_PREFIX}`, description: 'Development server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [__dirname + '/../modules/**/*.routes{.ts,.js}'],
};

export const swaggerSpec = swaggerJsdoc(options);
