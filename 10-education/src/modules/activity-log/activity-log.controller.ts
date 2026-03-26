import { Request, Response, NextFunction } from 'express';
import { ActivityLogService } from './activity-log.service';
import { successResponse } from '../../common/dto/api-response.dto';

const activityLogService = new ActivityLogService();

export const listActivityLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await activityLogService.findAll(req.query);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
};
