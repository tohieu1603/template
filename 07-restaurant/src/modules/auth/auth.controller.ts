import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new AuthService();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, fullName]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               fullName: { type: string }
 *     responses:
 *       201: { description: Registration successful }
 *       409: { description: Email already registered }
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.register(req.body);
    res.status(201).json(successResponse(result, 'Registration successful'));
  } catch (e) { next(e); }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.login(req.body, req.ip ?? '', req.get('user-agent') ?? '');
    res.json(successResponse(result, 'Login successful'));
  } catch (e) { next(e); }
};

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: Token refreshed }
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.refresh(req.body.refreshToken, req.ip ?? '', req.get('user-agent') ?? '');
    res.json(successResponse(result, 'Token refreshed'));
  } catch (e) { next(e); }
};

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and revoke refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: Logged out }
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.logout(req.body.refreshToken);
    res.json(successResponse(null, 'Logged out successfully'));
  } catch (e) { next(e); }
};

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200: { description: Current user data }
 *       401: { description: Unauthorized }
 */
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await service.getMe(req.user!.id);
    res.json(successResponse(user));
  } catch (e) { next(e); }
};
