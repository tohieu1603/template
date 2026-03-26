import { Request, Response, NextFunction } from 'express';
import { ReservationService } from './reservation.service';
import { successResponse } from '../../common/dto/api-response.dto';

const service = new ReservationService();

/**
 * @swagger
 * tags:
 *   name: Reservations
 *   description: Table reservation management
 */

export const listReservations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.query as any);
    res.json(successResponse(result.reservations, undefined, result.meta));
  } catch (e) { next(e); }
};

export const getReservation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const r = await service.findById(req.params.id);
    res.json(successResponse(r));
  } catch (e) { next(e); }
};

export const createReservation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const r = await service.create(req.body, req.user?.id);
    res.status(201).json(successResponse(r, 'Reservation created'));
  } catch (e) { next(e); }
};

export const updateReservation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const r = await service.update(req.params.id, req.body);
    res.json(successResponse(r, 'Reservation updated'));
  } catch (e) { next(e); }
};

export const confirmReservation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const r = await service.confirm(req.params.id, req.user?.id);
    res.json(successResponse(r, 'Reservation confirmed'));
  } catch (e) { next(e); }
};

export const seatReservation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const r = await service.seat(req.params.id, req.user?.id);
    res.json(successResponse(r, 'Customer seated'));
  } catch (e) { next(e); }
};

export const completeReservation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const r = await service.complete(req.params.id, req.user?.id);
    res.json(successResponse(r, 'Reservation completed'));
  } catch (e) { next(e); }
};

export const cancelReservation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const r = await service.cancel(req.params.id, req.body, req.user?.id);
    res.json(successResponse(r, 'Reservation cancelled'));
  } catch (e) { next(e); }
};

export const noShowReservation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const r = await service.noShow(req.params.id, req.user?.id);
    res.json(successResponse(r, 'Marked as no show'));
  } catch (e) { next(e); }
};

export const getReservationHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const history = await service.getHistory(req.params.id);
    res.json(successResponse(history));
  } catch (e) { next(e); }
};

export const deleteReservation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id);
    res.json(successResponse(null, 'Reservation deleted'));
  } catch (e) { next(e); }
};
