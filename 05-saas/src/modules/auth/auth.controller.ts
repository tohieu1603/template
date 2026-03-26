import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new AuthService();

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.register(req.body);
    res.status(201).json(successResponse(result, 'Registration successful'));
  } catch (error) { next(error); }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = req.ip ?? '';
    const userAgent = req.get('user-agent') ?? '';
    const result = await service.login(req.body, ip, userAgent);
    res.json(successResponse(result, 'Login successful'));
  } catch (error) { next(error); }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = req.ip ?? '';
    const userAgent = req.get('user-agent') ?? '';
    const result = await service.refresh(req.body.refreshToken, ip, userAgent);
    res.json(successResponse(result, 'Token refreshed'));
  } catch (error) { next(error); }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.logout(req.body.refreshToken);
    res.json(successResponse(null, 'Logged out successfully'));
  } catch (error) { next(error); }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await service.getMe(req.user!.id);
    res.json(successResponse(user));
  } catch (error) { next(error); }
};
