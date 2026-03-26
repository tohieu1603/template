import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { successResponse } from '../../common/dto/api-response.dto';

const userService = new UserService();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await userService.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.findOne(req.params.id);
    res.json(successResponse(user));
  } catch (error) { next(error); }
}

export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.create(req.body);
    res.status(201).json(successResponse(user, 'User created'));
  } catch (error) { next(error); }
}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.update(req.params.id, req.body);
    res.json(successResponse(user, 'User updated'));
  } catch (error) { next(error); }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await userService.remove(req.params.id);
    res.json(successResponse(null, 'User deleted'));
  } catch (error) { next(error); }
}
