import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ValidationError } from '../errors/app-error';

export function validateDto(DtoClass: any, source: 'body' | 'query' | 'params' = 'body') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const instance = plainToInstance(DtoClass, req[source]);
      const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: false });

      if (errors.length > 0) {
        const messages = errors.flatMap((e) =>
          Object.values(e.constraints ?? {}).map((msg) => msg),
        );
        throw new ValidationError('Validation failed', messages);
      }

      req[source] = instance as any;
      next();
    } catch (error) {
      next(error);
    }
  };
}
