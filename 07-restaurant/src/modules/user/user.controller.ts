import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new UserService();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.users, undefined, result.meta));
  } catch (e) { next(e); }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await service.findById(req.params.id);
    res.json(successResponse(user));
  } catch (e) { next(e); }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await service.create(req.body);
    res.status(201).json(successResponse(user, 'User created'));
  } catch (e) { next(e); }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await service.update(req.params.id, req.body);
    res.json(successResponse(user, 'User updated'));
  } catch (e) { next(e); }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id);
    res.json(successResponse(null, 'User deleted'));
  } catch (e) { next(e); }
};
