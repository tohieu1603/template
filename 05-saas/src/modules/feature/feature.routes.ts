import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listFeatures, getFeature, createFeature, updateFeature, deleteFeature, getOrgFeatures, setOrgFeature } from './feature.controller';
import { CreateFeatureDto, UpdateFeatureDto, SetOrgFeatureDto, FeatureQueryDto } from './dto/feature.dto';

/**
 * @swagger
 * tags:
 *   name: Features
 *   description: Feature flag management
 */

const router = Router();

router.get('/', auth(), validateDto(FeatureQueryDto, 'query'), listFeatures);
router.get('/:id', auth(), getFeature);
router.post('/', auth(), rbac('features.create'), validateDto(CreateFeatureDto), createFeature);
router.put('/:id', auth(), rbac('features.update'), validateDto(UpdateFeatureDto), updateFeature);
router.delete('/:id', auth(), rbac('features.delete'), deleteFeature);

// Org-level overrides
router.get('/org/:orgId', auth(), getOrgFeatures);
router.post('/org/:orgId', auth(), validateDto(SetOrgFeatureDto), setOrgFeature);

export default router;
