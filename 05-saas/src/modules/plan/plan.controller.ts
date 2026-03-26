import { Request, Response, NextFunction } from 'express';
import { PlanService } from './plan.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new PlanService();

export const listPlans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.plans, undefined, result.meta));
  } catch (e) { next(e); }
};

export const getPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plan = await service.findById(req.params.id);
    res.json(successResponse(plan));
  } catch (e) { next(e); }
};

export const createPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plan = await service.create(req.body);
    res.status(201).json(successResponse(plan, 'Plan created'));
  } catch (e) { next(e); }
};

export const updatePlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plan = await service.update(req.params.id, req.body);
    res.json(successResponse(plan, 'Plan updated'));
  } catch (e) { next(e); }
};

export const deletePlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id);
    res.json(successResponse(null, 'Plan deleted'));
  } catch (e) { next(e); }
};

export const addPlanFeature = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const feature = await service.addFeature(req.params.id, req.body);
    res.status(201).json(successResponse(feature, 'Feature added'));
  } catch (e) { next(e); }
};

export const removePlanFeature = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.removeFeature(req.params.featureId);
    res.json(successResponse(null, 'Feature removed'));
  } catch (e) { next(e); }
};
