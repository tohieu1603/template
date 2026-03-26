import { Request, Response, NextFunction } from 'express';
import { ActivityLogService } from './activity-log.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new ActivityLogService();

export const listLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.logs, undefined, result.meta));
  } catch (e) { next(e); }
};

export const deleteLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id);
    res.json(successResponse(null, 'Log deleted'));
  } catch (e) { next(e); }
};
