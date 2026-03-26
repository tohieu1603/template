import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import {
  listRoles, getRole, createRole, updateRole, deleteRole, assignPermissions,
  listPermissions, createPermission, deletePermission,
} from './role.controller';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto, CreatePermissionDto, RoleQueryDto } from './dto/role.dto';

const router = Router();

// Roles
router.get('/', auth(), rbac('roles.view'), validateDto(RoleQueryDto, 'query'), listRoles);
router.post('/', auth(), rbac('roles.create'), validateDto(CreateRoleDto), createRole);
router.get('/:id', auth(), rbac('roles.view'), getRole);
router.put('/:id', auth(), rbac('roles.update'), validateDto(UpdateRoleDto), updateRole);
router.delete('/:id', auth(), rbac('roles.delete'), deleteRole);
router.put('/:id/permissions', auth(), rbac('roles.update'), validateDto(AssignPermissionsDto), assignPermissions);

// Permissions
router.get('/permissions/all', auth(), rbac('roles.view'), listPermissions);
router.post('/permissions', auth(), rbac('roles.create'), validateDto(CreatePermissionDto), createPermission);
router.delete('/permissions/:id', auth(), rbac('roles.delete'), deletePermission);

export default router;
