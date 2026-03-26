import { Request, Response, NextFunction } from 'express';
import { UsageService } from './usage.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new UsageService();

export const recordUsage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await service.record(req.params.orgId, req.body);
    res.status(201).json(successResponse(record, 'Usage recorded'));
  } catch (e) { next(e); }
};

export const getCurrentPeriodUsage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const usage = await service.getCurrentPeriod(req.params.orgId);
    res.json(successResponse(usage));
  } catch (e) { next(e); }
};

export const getUsageHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.getHistory(req.params.orgId, req.query as any);
    res.json(successResponse(result.records, undefined, result.meta));
  } catch (e) { next(e); }
};
