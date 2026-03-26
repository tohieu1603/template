import { Request, Response, NextFunction } from 'express';
import { AvailabilityService } from './availability.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new AvailabilityService();

/**
 * @swagger
 * tags:
 *   name: Availability
 *   description: Time slot availability
 */

/**
 * @swagger
 * /availability:
 *   get:
 *     tags: [Availability]
 *     summary: Get available time slots for a service+provider+date
 *     security: []
 *     parameters:
 *       - in: query
 *         name: serviceId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: providerId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: date
 *         required: true
 *         schema: { type: string, format: date }
 *         description: Date in YYYY-MM-DD format
 *     responses:
 *       200:
 *         description: Available time slots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     slots:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           startTime: { type: string, example: "09:00" }
 *                           endTime: { type: string, example: "09:30" }
 *                           available: { type: boolean }
 */
export async function getAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { serviceId, providerId, date } = req.query as any;
    const slots = await service.getAvailableSlots(serviceId, providerId, date);
    res.json(successResponse({ slots, date, serviceId, providerId }));
  } catch (error) { next(error); }
}
