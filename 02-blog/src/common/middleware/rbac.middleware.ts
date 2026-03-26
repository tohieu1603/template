import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/app-error';
import { AppDataSource } from '../../config/database.config';

/**
 * RBAC middleware factory.
 * Checks if the authenticated user has a specific permission.
 *
 * Usage: router.get('/admin/users', auth(), rbac('users.view'), controller.list)
 *
 * @param permission - Permission string e.g. 'posts.create'
 */
export function rbac(permission: string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      // super_admin bypass: has all permissions
      if (req.user.roles.includes('super_admin')) {
        return next();
      }

      // Check if any of user's roles have the required permission
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

/**
 * Query DB to verify user has the required permission through their roles.
 */
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
