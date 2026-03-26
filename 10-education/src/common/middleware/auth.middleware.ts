import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token.util';
import { UnauthorizedError } from '../errors/app-error';
import { AppDataSource } from '../../config/database.config';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        roles: string[];
        permissions?: string[];
      };
    }
  }
}

export function auth(loadPermissions = false) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        throw new UnauthorizedError('No token provided');
      }

      const token = authHeader.split(' ')[1];
      const payload = verifyAccessToken(token);

      req.user = { id: payload.sub, email: payload.email, roles: payload.roles };

      if (loadPermissions) {
        const permissions = await loadUserPermissions(payload.sub);
        req.user.permissions = permissions;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

async function loadUserPermissions(userId: string): Promise<string[]> {
  const result = await AppDataSource.query(
    `SELECT DISTINCT p.name
     FROM permissions p
     JOIN role_permissions rp ON rp.permission_id = p.id
     JOIN user_roles ur ON ur.role_id = rp.role_id
     WHERE ur.user_id = $1`,
    [userId],
  );
  return result.map((row: any) => row.name);
}
