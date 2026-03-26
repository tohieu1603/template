import { Router } from 'express';
import { listReservations, getReservation, createReservation, updateReservation, confirmReservation, seatReservation, completeReservation, cancelReservation, noShowReservation, getReservationHistory, deleteReservation } from './reservation.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { CreateReservationDto, UpdateReservationDto, CancelReservationDto, ReservationQueryDto } from './dto/reservation.dto';

const router = Router();

router.get('/', auth(), rbac('reservations.view'), validateDto(ReservationQueryDto, 'query'), listReservations);
router.get('/:id', auth(), rbac('reservations.view'), getReservation);
router.get('/:id/history', auth(), rbac('reservations.view'), getReservationHistory);
router.post('/', validateDto(CreateReservationDto), createReservation);
router.put('/:id', auth(), rbac('reservations.update'), validateDto(UpdateReservationDto), updateReservation);
router.patch('/:id/confirm', auth(), rbac('reservations.update'), confirmReservation);
router.patch('/:id/seat', auth(), rbac('reservations.update'), seatReservation);
router.patch('/:id/complete', auth(), rbac('reservations.update'), completeReservation);
router.patch('/:id/cancel', auth(), validateDto(CancelReservationDto), cancelReservation);
router.patch('/:id/no-show', auth(), rbac('reservations.update'), noShowReservation);
router.delete('/:id', auth(), rbac('reservations.delete'), deleteReservation);

export default router;
