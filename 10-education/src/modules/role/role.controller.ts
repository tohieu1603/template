import { Request, Response, NextFunction } from 'express';
import { RoleService } from './role.service';
import { successResponse } from '../../common/dto/api-response.dto';

const roleService = new RoleService();

export const listRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await roleService.findAll(req.query);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
};

export const getRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = await roleService.findById(req.params.id);
    res.json(successResponse(role));
  } catch (error) { next(error); }
};

export const createRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = await roleService.create(req.body);
    res.status(201).json(successResponse(role, 'Role created'));
  } catch (error) { next(error); }
};

export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = await roleService.update(req.params.id, req.body);
    res.json(successResponse(role, 'Role updated'));
  } catch (error) { next(error); }
};

export const deleteRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await roleService.delete(req.params.id);
    res.json(successResponse(null, 'Role deleted'));
  } catch (error) { next(error); }
};

export const assignPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = await roleService.assignPermissions(req.params.id, req.body);
    res.json(successResponse(role, 'Permissions assigned'));
  } catch (error) { next(error); }
};

export const listPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await roleService.findAllPermissions(req.query);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
};

export const assignRoleToUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await roleService.assignRoleToUser(req.params.userId, req.body.roleId);
    res.json(successResponse(null, 'Role assigned to user'));
  } catch (error) { next(error); }
};

export const removeRoleFromUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await roleService.removeRoleFromUser(req.params.userId, req.params.roleId);
    res.json(successResponse(null, 'Role removed from user'));
  } catch (error) { next(error); }
};
