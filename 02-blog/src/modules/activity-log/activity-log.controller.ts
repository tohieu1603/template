import { Request, Response, NextFunction } from 'express';
import { ActivityLogService } from './activity-log.service';
import { successResponse } from '../../common/dto/api-response.dto';

const activityLogService = new ActivityLogService();

/**
 * @swagger
 * tags:
 *   name: ActivityLogs
 *   description: System activity log (admin only)
 */

export async function listActivityLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { logs, meta } = await activityLogService.findAll(req.query as any);
    res.json(successResponse(logs, undefined, meta));
  } catch (error) { next(error); }
}
