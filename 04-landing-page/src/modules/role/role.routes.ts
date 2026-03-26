import { Router } from 'express';
import { listRoles, getRole, createRole, updateRole, deleteRole, assignPermissions, listPermissions } from './role.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from './dto/role.dto';

const router = Router();

router.get('/permissions', auth(), rbac('roles.view'), listPermissions);
router.get('/', auth(), rbac('roles.view'), listRoles);
router.get('/:id', auth(), rbac('roles.view'), getRole);
router.post('/', auth(), rbac('roles.create'), validateDto(CreateRoleDto), createRole);
router.put('/:id', auth(), rbac('roles.update'), validateDto(UpdateRoleDto), updateRole);
router.delete('/:id', auth(), rbac('roles.delete'), deleteRole);
router.put('/:id/permissions', auth(), rbac('roles.update'), validateDto(AssignPermissionsDto), assignPermissions);

export default router;
