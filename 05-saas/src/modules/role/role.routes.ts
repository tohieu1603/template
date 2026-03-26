import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listRoles, getRole, createRole, updateRole, assignPermissions, deleteRole, listPermissions } from './role.controller';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto, RoleQueryDto } from './dto/role.dto';

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role and permission management
 */

const router = Router();

router.get('/', auth(), rbac('roles.view'), validateDto(RoleQueryDto, 'query'), listRoles);
router.get('/permissions', auth(), rbac('roles.view'), listPermissions);
router.get('/:id', auth(), rbac('roles.view'), getRole);
router.post('/', auth(), rbac('roles.create'), validateDto(CreateRoleDto), createRole);
router.put('/:id', auth(), rbac('roles.update'), validateDto(UpdateRoleDto), updateRole);
router.post('/:id/permissions', auth(), rbac('roles.update'), validateDto(AssignPermissionsDto), assignPermissions);
router.delete('/:id', auth(), rbac('roles.delete'), deleteRole);

export default router;
