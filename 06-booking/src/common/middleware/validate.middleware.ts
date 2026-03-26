import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ValidationError } from '../errors/app-error';

export function validateDto(DtoClass: any, source: 'body' | 'query' | 'params' = 'body') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = plainToInstance(DtoClass, req[source]);
      const errors = await validate(data, {
        whitelist: true,
        forbidNonWhitelisted: false,
        skipMissingProperties: false,
      });

      if (errors.length > 0) {
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          messages: Object.values(error.constraints ?? {}),
        }));
        throw new ValidationError('Validation failed', formattedErrors);
      }

      req[source] = data as any;
      next();
    } catch (error) {
      next(error);
    }
  };
}
