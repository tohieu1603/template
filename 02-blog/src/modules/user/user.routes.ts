import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import {
  listUsers, getUser, createUser, updateUser, deleteUser,
  updatePassword, assignRole, removeRole,
} from './user.controller';
import { CreateUserDto, UpdateUserDto, UpdatePasswordDto, UserQueryDto } from './dto/user.dto';

const router = Router();

// Admin user management
router.get('/', auth(), rbac('users.view'), validateDto(UserQueryDto, 'query'), listUsers);
router.post('/', auth(), rbac('users.create'), validateDto(CreateUserDto), createUser);
router.get('/:id', auth(), rbac('users.view'), getUser);
router.put('/:id', auth(), rbac('users.update'), validateDto(UpdateUserDto), updateUser);
router.delete('/:id', auth(), rbac('users.delete'), deleteUser);

// Current user operations
router.put('/me/password', auth(), validateDto(UpdatePasswordDto), updatePassword);

// Role management
router.post('/:id/roles/:roleId', auth(), rbac('users.update'), assignRole);
router.delete('/:id/roles/:roleId', auth(), rbac('users.update'), removeRole);

export default router;
