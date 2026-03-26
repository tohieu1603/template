import { Router } from 'express';
import { register, login, refreshToken, logout, getMe } from './auth.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';

const router = Router();

router.post('/register', validateDto(RegisterDto), register);
router.post('/login', validateDto(LoginDto), login);
router.post('/refresh', validateDto(RefreshTokenDto), refreshToken);
router.post('/logout', validateDto(RefreshTokenDto), logout);
router.get('/me', auth(), getMe);

export default router;
