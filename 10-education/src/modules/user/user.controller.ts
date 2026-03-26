import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { successResponse } from '../../common/dto/api-response.dto';

const userService = new UserService();

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.findById(req.user!.id);
    res.json(successResponse(user));
  } catch (error) { next(error); }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.update(req.user!.id, req.body);
    res.json(successResponse(user, 'Profile updated'));
  } catch (error) { next(error); }
};

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.findById(req.params.id);
    res.json(successResponse(user));
  } catch (error) { next(error); }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.create(req.body);
    res.status(201).json(successResponse(user, 'User created'));
  } catch (error) { next(error); }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.update(req.params.id, req.body);
    res.json(successResponse(user, 'User updated'));
  } catch (error) { next(error); }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userService.delete(req.params.id);
    res.json(successResponse(null, 'User deleted'));
  } catch (error) { next(error); }
};
