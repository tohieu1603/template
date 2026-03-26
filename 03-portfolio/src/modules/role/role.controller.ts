import { Request, Response, NextFunction } from 'express';
import { RoleService } from './role.service';
import { successResponse } from '../../common/dto/api-response.dto';

const roleService = new RoleService();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role and permission management
 */

export async function listRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await roleService.findAll(req.query as any);
    res.json(successResponse(result.roles, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = await roleService.findById(req.params.id);
    res.json(successResponse(role));
  } catch (error) { next(error); }
}

export async function createRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = await roleService.create(req.body);
    res.status(201).json(successResponse(role, 'Role created'));
  } catch (error) { next(error); }
}

export async function updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = await roleService.update(req.params.id, req.body);
    res.json(successResponse(role, 'Role updated'));
  } catch (error) { next(error); }
}

export async function deleteRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await roleService.delete(req.params.id);
    res.json(successResponse(null, 'Role deleted'));
  } catch (error) { next(error); }
}

export async function listPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const permissions = await roleService.findAllPermissions();
    res.json(successResponse(permissions));
  } catch (error) { next(error); }
}

export async function assignPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = await roleService.assignPermissions(req.params.id, req.body);
    res.json(successResponse(role, 'Permissions assigned'));
  } catch (error) { next(error); }
}
