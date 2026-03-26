import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import { errorResponse } from '../dto/api-response.dto';
import { logger } from '../utils/logger';
import { env } from '../../config/env.config';

export function errorHandlerMiddleware(error: Error, req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      logger.error(`[${req.method}] ${req.path} - ${error.message}`, { stack: error.stack });
    }
    res.status(error.statusCode).json(errorResponse(error.message, error.errors));
    return;
  }
  if ((error as any).code === '23505') {
    res.status(409).json(errorResponse('Resource already exists'));
    return;
  }
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json(errorResponse('Invalid token'));
    return;
  }
  if (error.name === 'TokenExpiredError') {
    res.status(401).json(errorResponse('Token expired'));
    return;
  }
  logger.error(`Unhandled error [${req.method}] ${req.path}`, { message: error.message, stack: error.stack });
  const message = env.isProduction ? 'Internal server error' : error.message;
  res.status(500).json(errorResponse(message));
}
