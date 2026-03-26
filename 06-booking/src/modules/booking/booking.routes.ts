import { Router } from 'express';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateBookingDto, CancelBookingDto, BookingQueryDto } from './dto/booking.dto';
import {
  listBookings, getBooking, createBooking, confirmBooking,
  cancelBooking, completeBooking, noShowBooking, getBookingHistory,
} from './booking.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management
 */

router.get('/', auth(), validateDto(BookingQueryDto, 'query'), listBookings);
router.get('/:id', auth(), getBooking);
router.get('/:id/history', auth(), getBookingHistory);
router.post('/', auth(), validateDto(CreateBookingDto), createBooking);
router.patch('/:id/confirm', auth(), rbac('bookings.update'), confirmBooking);
router.patch('/:id/cancel', auth(), validateDto(CancelBookingDto), cancelBooking);
router.patch('/:id/complete', auth(), rbac('bookings.update'), completeBooking);
router.patch('/:id/no-show', auth(), rbac('bookings.update'), noShowBooking);

export default router;
