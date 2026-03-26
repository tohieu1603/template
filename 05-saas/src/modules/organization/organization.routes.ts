import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listOrganizations, getOrganization, createOrganization, updateOrganization, deleteOrganization, getMyOrganizations } from './organization.controller';
import { CreateOrganizationDto, UpdateOrganizationDto, OrganizationQueryDto } from './dto/organization.dto';

/**
 * @swagger
 * tags:
 *   name: Organizations
 *   description: Multi-tenant organization management
 */

const router = Router();

router.get('/my', auth(), getMyOrganizations);
router.get('/', auth(), rbac('organizations.view'), validateDto(OrganizationQueryDto, 'query'), listOrganizations);
router.get('/:id', auth(), getOrganization);
router.post('/', auth(), validateDto(CreateOrganizationDto), createOrganization);
router.put('/:id', auth(), validateDto(UpdateOrganizationDto), updateOrganization);
router.delete('/:id', auth(), rbac('organizations.delete'), deleteOrganization);

export default router;
