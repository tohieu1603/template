import { AppDataSource } from '../../config/database.config';
import { WorkingHours } from '../provider/entities/working-hours.entity';
import { ProviderBreak } from '../provider/entities/provider-break.entity';
import { Booking } from '../booking/entities/booking.entity';
import { BlockedSlot } from '../booking/entities/blocked-slot.entity';
import { Holiday } from '../holiday/entities/holiday.entity';
import { Service } from '../service/entities/service.entity';
import { NotFoundError, UnprocessableError } from '../../common/errors/app-error';

export interface TimeSlotResult {
  startTime: string;
  endTime: string;
  available: boolean;
}

export class AvailabilityService {
  async getAvailableSlots(serviceId: string, providerId: string, date: string): Promise<TimeSlotResult[]> {
    // 1. Get service duration + buffer
    const service = await AppDataSource.getRepository(Service).findOne({ where: { id: serviceId } });
    if (!service) throw new NotFoundError('Service');

    const slotDuration = service.durationMinutes;
    const bufferMinutes = service.bufferMinutes || 0;

    // 2. Parse date and get day of week (0=Sunday)
    const dateObj = new Date(date + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();

    // 3. Check if it's a holiday
    const holiday = await AppDataSource.getRepository(Holiday).findOne({
      where: { date },
    });

    // Also check recurring holidays (same month-day)
    const monthDay = date.slice(5); // MM-DD
    const recurringHoliday = await AppDataSource.query(
      `SELECT id FROM holidays WHERE is_recurring = true AND TO_CHAR(date::date, 'MM-DD') = $1`,
      [monthDay],
    );

    if (holiday || recurringHoliday.length > 0) {
      return []; // Holiday - no slots
    }

    // 4. Get working hours for that day
    const workingHours = await AppDataSource.getRepository(WorkingHours).findOne({
      where: { providerId, dayOfWeek, isAvailable: true },
    });

    if (!workingHours) {
      return []; // Provider doesn't work this day
    }

    // 5. Get provider breaks for that day
    const breaks = await AppDataSource.getRepository(ProviderBreak).find({
      where: { providerId, dayOfWeek },
    });

    // 6. Get existing bookings for that date
    const existingBookings = await AppDataSource.getRepository(Booking).find({
      where: { providerId, bookingDate: date },
    });
    const activeBookings = existingBookings.filter(b => !['cancelled', 'no_show'].includes(b.status));

    // 7. Get blocked slots for that date
    const blockedSlots = await AppDataSource.getRepository(BlockedSlot).find({
      where: { providerId, blockedDate: date },
    });

    // Check if whole day is blocked
    const wholeDayBlocked = blockedSlots.some(slot => !slot.startTime && !slot.endTime);
    if (wholeDayBlocked) {
      return [];
    }

    // 8. Generate time slots (every 15 minutes or slotDuration if > 30)
    const interval = slotDuration <= 30 ? 15 : 30;
    const slots: TimeSlotResult[] = [];

    const [whStartH, whStartM] = workingHours.startTime.split(':').map(Number);
    const [whEndH, whEndM] = workingHours.endTime.split(':').map(Number);
    const workStart = whStartH * 60 + whStartM;
    const workEnd = whEndH * 60 + whEndM;

    for (let slotStart = workStart; slotStart + slotDuration <= workEnd; slotStart += interval) {
      const slotEnd = slotStart + slotDuration;
      const slotEndWithBuffer = slotEnd + bufferMinutes;

      const startTime = minutesToTime(slotStart);
      const endTime = minutesToTime(slotEnd);

      let available = true;

      // Check breaks
      for (const brk of breaks) {
        const [bh, bm] = brk.startTime.split(':').map(Number);
        const [eh, em] = brk.endTime.split(':').map(Number);
        const bStart = bh * 60 + bm;
        const bEnd = eh * 60 + em;
        if (slotStart < bEnd && slotEndWithBuffer > bStart) {
          available = false;
          break;
        }
      }

      // Check existing bookings
      if (available) {
        for (const booking of activeBookings) {
          const [bh, bm] = booking.startTime.split(':').map(Number);
          const [eh, em] = booking.endTime.split(':').map(Number);
          const bStart = bh * 60 + bm;
          const bEnd = eh * 60 + em;
          if (slotStart < bEnd && slotEndWithBuffer > bStart) {
            available = false;
            break;
          }
        }
      }

      // Check blocked slots (partial day)
      if (available) {
        for (const blocked of blockedSlots) {
          if (blocked.startTime && blocked.endTime) {
            const [bh, bm] = blocked.startTime.split(':').map(Number);
            const [eh, em] = blocked.endTime.split(':').map(Number);
            const bStart = bh * 60 + bm;
            const bEnd = eh * 60 + em;
            if (slotStart < bEnd && slotEnd > bStart) {
              available = false;
              break;
            }
          }
        }
      }

      slots.push({ startTime, endTime, available });
    }

    return slots;
  }
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
