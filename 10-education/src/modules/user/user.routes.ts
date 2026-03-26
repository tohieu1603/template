import { Router } from 'express';
import { listUsers, getUser, getProfile, updateProfile, createUser, updateUser, deleteUser } from './user.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto/user.dto';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */
const router = Router();

router.get('/profile', auth(), getProfile);
router.put('/profile', auth(), validateDto(UpdateUserDto), updateProfile);
router.get('/', auth(), rbac('users.view'), validateDto(UserQueryDto, 'query'), listUsers);
router.get('/:id', auth(), rbac('users.view'), getUser);
router.post('/', auth(), rbac('users.create'), validateDto(CreateUserDto), createUser);
router.put('/:id', auth(), rbac('users.update'), validateDto(UpdateUserDto), updateUser);
router.delete('/:id', auth(), rbac('users.delete'), deleteUser);

export default router;
