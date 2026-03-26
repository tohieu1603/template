import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from './subscription.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new SubscriptionService();

export const listSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.subscriptions, undefined, result.meta));
  } catch (e) { next(e); }
};

export const getCurrentSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sub = await service.getCurrent(req.params.orgId);
    res.json(successResponse(sub));
  } catch (e) { next(e); }
};

export const createSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sub = await service.create(req.params.orgId, req.body);
    res.status(201).json(successResponse(sub, 'Subscription created'));
  } catch (e) { next(e); }
};

export const upgradeSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sub = await service.upgrade(req.params.orgId, req.body);
    res.json(successResponse(sub, 'Subscription updated'));
  } catch (e) { next(e); }
};

export const cancelSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sub = await service.cancel(req.params.orgId);
    res.json(successResponse(sub, 'Subscription cancelled at period end'));
  } catch (e) { next(e); }
};
