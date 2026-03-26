import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/app-error';
import { AppDataSource } from '../../config/database.config';

export function rbac(permission: string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (req.user.roles.includes('super_admin')) {
        return next();
      }

      const hasPermission = await checkUserPermission(req.user.id, permission);
      if (!hasPermission) {
        throw new ForbiddenError(`Permission '${permission}' required`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

async function checkUserPermission(userId: string, permission: string): Promise<boolean> {
  const result = await AppDataSource.query(
    `SELECT 1
     FROM permissions p
     JOIN role_permissions rp ON rp.permission_id = p.id
     JOIN user_roles ur ON ur.role_id = rp.role_id
     WHERE ur.user_id = $1 AND p.name = $2
     LIMIT 1`,
    [userId, permission],
  );
  return result.length > 0;
}
