import { Request, Response, NextFunction } from 'express';
import { RoleService } from './role.service';
import { successResponse } from '../../common/dto/api-response.dto';

const roleService = new RoleService();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role and permission management (admin)
 */

/**
 * @swagger
 * /roles:
 *   get:
 *     tags: [Roles]
 *     summary: List all roles with permissions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated roles list
 */
export async function listRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { roles, meta } = await roleService.findAllRoles(req.query as any);
    res.json(successResponse(roles, undefined, meta));
  } catch (error) {
    next(error);
  }
}

export async function getRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = await roleService.findRoleById(req.params.id);
    res.json(successResponse(role));
  } catch (error) {
    next(error);
  }
}

export async function createRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = await roleService.createRole(req.body);
    res.status(201).json(successResponse(role, 'Role created successfully'));
  } catch (error) {
    next(error);
  }
}

export async function updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = await roleService.updateRole(req.params.id, req.body);
    res.json(successResponse(role, 'Role updated successfully'));
  } catch (error) {
    next(error);
  }
}

export async function deleteRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await roleService.deleteRole(req.params.id);
    res.json(successResponse(null, 'Role deleted successfully'));
  } catch (error) {
    next(error);
  }
}

export async function assignPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await roleService.assignPermissions(req.params.id, req.body);
    res.json(successResponse(null, 'Permissions assigned successfully'));
  } catch (error) {
    next(error);
  }
}

// Permissions endpoints
export async function listPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { permissions, meta } = await roleService.findAllPermissions(req.query as any);
    res.json(successResponse(permissions, undefined, meta));
  } catch (error) {
    next(error);
  }
}

export async function createPermission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const permission = await roleService.createPermission(req.body);
    res.status(201).json(successResponse(permission, 'Permission created'));
  } catch (error) {
    next(error);
  }
}

export async function deletePermission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await roleService.deletePermission(req.params.id);
    res.json(successResponse(null, 'Permission deleted'));
  } catch (error) {
    next(error);
  }
}
