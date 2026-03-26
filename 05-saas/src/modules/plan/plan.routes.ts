import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { listPlans, getPlan, createPlan, updatePlan, deletePlan, addPlanFeature, removePlanFeature } from './plan.controller';
import { CreatePlanDto, UpdatePlanDto, CreatePlanFeatureDto, PlanQueryDto } from './dto/plan.dto';

/**
 * @swagger
 * tags:
 *   name: Plans
 *   description: Subscription plan management
 */

const router = Router();

router.get('/', validateDto(PlanQueryDto, 'query'), listPlans);
router.get('/:id', getPlan);
router.post('/', auth(), rbac('plans.create'), validateDto(CreatePlanDto), createPlan);
router.put('/:id', auth(), rbac('plans.update'), validateDto(UpdatePlanDto), updatePlan);
router.delete('/:id', auth(), rbac('plans.delete'), deletePlan);
router.post('/:id/features', auth(), rbac('plans.update'), validateDto(CreatePlanFeatureDto), addPlanFeature);
router.delete('/:id/features/:featureId', auth(), rbac('plans.update'), removePlanFeature);

export default router;
