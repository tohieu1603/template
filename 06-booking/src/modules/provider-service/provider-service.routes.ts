import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { AssignServiceDto } from './dto/provider-service.dto';
import { getProviderServices, getServiceProviders, assignService, removeService } from './provider-service.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: ProviderServices
 *   description: Provider-service assignments
 */

// GET /provider-services?providerId=uuid — get services for a provider
// GET /provider-services?serviceId=uuid — get providers for a service
router.get('/by-provider/:providerId', getProviderServices);
router.get('/by-service/:serviceId', getServiceProviders);
router.post('/assign/:providerId', auth(), rbac('providers.update'), validateDto(AssignServiceDto), assignService);
router.delete('/remove/:providerId/:serviceId', auth(), rbac('providers.update'), removeService);

export default router;
