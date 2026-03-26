import { Request, Response, NextFunction } from 'express';
import { RoleService } from './role.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new RoleService();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role and permission management
 */

export const listRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAllRoles(req.query as any);
    res.json(successResponse(result.roles, undefined, result.meta));
  } catch (e) { next(e); }
};

export const getRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = await service.findRoleById(req.params.id);
    res.json(successResponse(role));
  } catch (e) { next(e); }
};

export const createRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = await service.createRole(req.body);
    res.status(201).json(successResponse(role, 'Role created'));
  } catch (e) { next(e); }
};

export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = await service.updateRole(req.params.id, req.body);
    res.json(successResponse(role, 'Role updated'));
  } catch (e) { next(e); }
};

export const deleteRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.deleteRole(req.params.id);
    res.json(successResponse(null, 'Role deleted'));
  } catch (e) { next(e); }
};

export const assignPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = await service.assignPermissions(req.params.id, req.body);
    res.json(successResponse(role, 'Permissions assigned'));
  } catch (e) { next(e); }
};

export const listPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permissions = await service.findAllPermissions();
    res.json(successResponse(permissions));
  } catch (e) { next(e); }
};
