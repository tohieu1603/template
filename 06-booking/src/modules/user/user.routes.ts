import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto, AssignRoleDto, UserQueryDto } from './dto/user.dto';
import { listUsers, getUser, createUser, updateUser, deleteUser, changePassword, assignRole, removeRole } from './user.controller';

const router = Router();

router.get('/', auth(), rbac('users.view'), validateDto(UserQueryDto, 'query'), listUsers);
router.get('/:id', auth(), rbac('users.view'), getUser);
router.post('/', auth(), rbac('users.create'), validateDto(CreateUserDto), createUser);
router.put('/:id', auth(), rbac('users.update'), validateDto(UpdateUserDto), updateUser);
router.delete('/:id', auth(), rbac('users.delete'), deleteUser);
router.post('/:id/change-password', auth(), validateDto(ChangePasswordDto), changePassword);
router.post('/:id/roles', auth(), rbac('users.update'), validateDto(AssignRoleDto), assignRole);
router.delete('/:id/roles/:roleId', auth(), rbac('users.update'), removeRole);

export default router;
