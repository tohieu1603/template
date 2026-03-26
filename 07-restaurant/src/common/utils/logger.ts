import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { env } from '../../config/env.config';

const logDir = env.LOG_DIR;
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] [${level.toUpperCase()}]: ${stack || message}`;
  }),
);

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  transports: [
    new winston.transports.Console({ format: env.isProduction ? jsonFormat : logFormat }),
    new winston.transports.File({ filename: path.join(logDir, 'combined.log'), format: jsonFormat, maxsize: 10 * 1024 * 1024, maxFiles: 5 }),
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error', format: jsonFormat, maxsize: 10 * 1024 * 1024, maxFiles: 5 }),
  ],
  exceptionHandlers: [new winston.transports.File({ filename: path.join(logDir, 'exceptions.log') })],
  rejectionHandlers: [new winston.transports.File({ filename: path.join(logDir, 'rejections.log') })],
});
