import { Request, Response, NextFunction } from 'express';
import { BookingService } from './booking.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new BookingService();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management
 */

export async function listBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
}

export async function getBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.findById(req.params.id);
    res.json(successResponse(item));
  } catch (error) { next(error); }
}

export async function createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.create(req.body, req.user!.id);
    res.status(201).json(successResponse(item, 'Booking created'));
  } catch (error) { next(error); }
}

export async function confirmBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.confirm(req.params.id, req.user!.id);
    res.json(successResponse(item, 'Booking confirmed'));
  } catch (error) { next(error); }
}

export async function cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.cancel(req.params.id, req.body, req.user!.id);
    res.json(successResponse(item, 'Booking cancelled'));
  } catch (error) { next(error); }
}

export async function completeBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.complete(req.params.id, req.user!.id);
    res.json(successResponse(item, 'Booking completed'));
  } catch (error) { next(error); }
}

export async function noShowBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.noShow(req.params.id, req.user!.id);
    res.json(successResponse(item, 'Booking marked as no-show'));
  } catch (error) { next(error); }
}

export async function getBookingHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await service.getStatusHistory(req.params.id);
    res.json(successResponse(items));
  } catch (error) { next(error); }
}
