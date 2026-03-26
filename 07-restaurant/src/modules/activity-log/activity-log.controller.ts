import { Request, Response, NextFunction } from 'express';
import { ActivityLogService } from './activity-log.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new ActivityLogService();

/**
 * @swagger
 * tags:
 *   name: ActivityLogs
 *   description: Activity log management
 */

export const listLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.logs, undefined, result.meta));
  } catch (e) { next(e); }
};
