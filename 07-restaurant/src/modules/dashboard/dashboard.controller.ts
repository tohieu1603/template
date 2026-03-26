import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new DashboardService();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard statistics
 */

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard statistics
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 */
export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await service.getStats();
    res.json(successResponse(stats));
  } catch (e) { next(e); }
};
