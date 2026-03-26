import { Router } from 'express';
import { register, login, refresh, logout, getMe } from './auth.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { RegisterDto, LoginDto, RefreshTokenDto, LogoutDto } from './dto/auth.dto';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */
const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               fullName: { type: string }
 *     responses:
 *       201:
 *         description: Registration successful
 */
router.post('/register', validateDto(RegisterDto), register);
router.post('/login', validateDto(LoginDto), login);
router.post('/refresh', validateDto(RefreshTokenDto), refresh);
router.post('/logout', validateDto(LogoutDto), logout);
router.get('/me', auth(), getMe);

export default router;
