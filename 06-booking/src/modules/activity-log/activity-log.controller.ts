import { Request, Response, NextFunction } from 'express';
import { ActivityLogService } from './activity-log.service';
import { successResponse } from '../../common/dto/api-response.dto';

const activityLogService = new ActivityLogService();

/**
 * @swagger
 * tags:
 *   name: ActivityLogs
 *   description: Audit trail / activity logs
 */

/**
 * @swagger
 * /activity-logs:
 *   get:
 *     tags: [ActivityLogs]
 *     summary: List activity logs
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200: { description: Activity logs }
 */
export async function listActivityLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await activityLogService.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) {
    next(error);
  }
}
