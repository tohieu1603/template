import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { register, login, refreshToken, logout, getMe } from './auth.controller';

const router = Router();

router.post('/register', validateDto(RegisterDto), register);
router.post('/login', validateDto(LoginDto), login);
router.post('/refresh', validateDto(RefreshTokenDto), refreshToken);
router.post('/logout', logout);
router.get('/me', auth(), getMe);

export default router;
