import { AppDataSource } from '../../config/database.config';
import { Booking } from './entities/booking.entity';
import { BookingStatusHistory } from './entities/booking-status-history.entity';
import { Service } from '../service/entities/service.entity';
import { CreateBookingDto, CancelBookingDto, BookingQueryDto } from './dto/booking.dto';
import { NotFoundError, UnprocessableError, ConflictError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class BookingService {
  private bookingRepo = AppDataSource.getRepository(Booking);
  private historyRepo = AppDataSource.getRepository(BookingStatusHistory);
  private serviceRepo = AppDataSource.getRepository(Service);

  async findAll(query: BookingQueryDto) {
    const { page = 1, limit = 10, status, providerId, serviceId, customerId, dateFrom, dateTo, date } = query;
    const offset = (page - 1) * limit;

    const params: any[] = [];
    let idx = 1;
    let sql = `
      SELECT b.*,
        u.full_name as customer_name, u.email as customer_email,
        p.name as provider_name,
        s.name as service_name
      FROM bookings b
      LEFT JOIN users u ON u.id = b.customer_id
      LEFT JOIN providers p ON p.id = b.provider_id
      LEFT JOIN services s ON s.id = b.service_id
      WHERE 1=1
    `;

    if (status) { sql += ` AND b.status = $${idx++}`; params.push(status); }
    if (providerId) { sql += ` AND b.provider_id = $${idx++}`; params.push(providerId); }
    if (serviceId) { sql += ` AND b.service_id = $${idx++}`; params.push(serviceId); }
    if (customerId) { sql += ` AND b.customer_id = $${idx++}`; params.push(customerId); }
    if (date) { sql += ` AND b.booking_date = $${idx++}`; params.push(date); }
    if (dateFrom) { sql += ` AND b.booking_date >= $${idx++}`; params.push(dateFrom); }
    if (dateTo) { sql += ` AND b.booking_date <= $${idx++}`; params.push(dateTo); }

    const countSql = sql.replace(
      `SELECT b.*,
        u.full_name as customer_name, u.email as customer_email,
        p.name as provider_name,
        s.name as service_name`,
      'SELECT COUNT(*)',
    );

    sql += ` ORDER BY b.booking_date DESC, b.start_time DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, offset);

    const countParams = params.slice(0, -2);
    const [items, countResult] = await Promise.all([
      AppDataSource.query(sql, params),
      AppDataSource.query(countSql, countParams),
    ]);

    return { items, meta: buildPaginationMeta(page, limit, parseInt(countResult[0].count, 10)) };
  }

  async findById(id: string) {
    const result = await AppDataSource.query(
      `SELECT b.*,
        u.full_name as customer_name, u.email as customer_email,
        p.name as provider_name,
        s.name as service_name, s.duration_minutes
       FROM bookings b
       LEFT JOIN users u ON u.id = b.customer_id
       LEFT JOIN providers p ON p.id = b.provider_id
       LEFT JOIN services s ON s.id = b.service_id
       WHERE b.id = $1`,
      [id],
    );
    if (!result.length) throw new NotFoundError('Booking');
    return result[0];
  }

  async create(dto: CreateBookingDto, customerId: string) {
    // Get service info
    const svc = await this.serviceRepo.findOne({ where: { id: dto.serviceId } });
    if (!svc) throw new NotFoundError('Service');

    // Calculate end time
    const [h, m] = dto.startTime.split(':').map(Number);
    const startMinutes = h * 60 + m;
    const endMinutes = startMinutes + svc.durationMinutes;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

    // Check for conflicts
    const conflict = await AppDataSource.query(
      `SELECT id FROM bookings
       WHERE provider_id = $1
         AND booking_date = $2
         AND status NOT IN ('cancelled', 'no_show')
         AND (
           (start_time <= $3 AND end_time > $3) OR
           (start_time < $4 AND end_time >= $4) OR
           (start_time >= $3 AND end_time <= $4)
         )`,
      [dto.providerId, dto.bookingDate, dto.startTime, endTime],
    );

    if (conflict.length > 0) {
      throw new ConflictError('Time slot is not available');
    }

    // Generate booking number
    const bookingNumber = await this.generateBookingNumber();

    const booking = this.bookingRepo.create({
      customerId,
      providerId: dto.providerId,
      serviceId: dto.serviceId,
      bookingNumber,
      bookingDate: dto.bookingDate,
      startTime: dto.startTime,
      endTime,
      durationMinutes: svc.durationMinutes,
      price: svc.price,
      depositAmount: svc.requiresDeposit ? (svc.depositAmount || 0) : 0,
      note: dto.note,
      status: 'pending',
    });

    const saved = await this.bookingRepo.save(booking);

    // Record status history
    await this.historyRepo.save(this.historyRepo.create({
      bookingId: saved.id,
      fromStatus: null,
      toStatus: 'pending',
      note: 'Booking created',
      changedBy: customerId,
    }));

    return saved;
  }

  async confirm(id: string, userId: string): Promise<Booking> {
    return this.changeStatus(id, 'confirmed', userId, 'Booking confirmed');
  }

  async cancel(id: string, dto: CancelBookingDto, userId: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({ where: { id } });
    if (!booking) throw new NotFoundError('Booking');
    if (['completed', 'cancelled'].includes(booking.status)) {
      throw new UnprocessableError(`Cannot cancel a ${booking.status} booking`);
    }

    const old = booking.status;
    booking.status = 'cancelled';
    booking.cancellationReason = dto.reason;
    booking.cancelledAt = new Date();
    const saved = await this.bookingRepo.save(booking);

    await this.historyRepo.save(this.historyRepo.create({
      bookingId: id,
      fromStatus: old,
      toStatus: 'cancelled',
      note: dto.reason,
      changedBy: userId,
    }));

    return saved;
  }

  async complete(id: string, userId: string): Promise<Booking> {
    return this.changeStatus(id, 'completed', userId, 'Booking completed');
  }

  async noShow(id: string, userId: string): Promise<Booking> {
    return this.changeStatus(id, 'no_show', userId, 'Customer no show');
  }

  async getStatusHistory(bookingId: string) {
    return this.historyRepo.find({
      where: { bookingId },
      order: { createdAt: 'ASC' },
    });
  }

  private async changeStatus(id: string, newStatus: string, userId: string, note: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({ where: { id } });
    if (!booking) throw new NotFoundError('Booking');

    const old = booking.status;
    booking.status = newStatus;
    if (newStatus === 'confirmed') booking.confirmedAt = new Date();
    if (newStatus === 'completed') booking.completedAt = new Date();

    const saved = await this.bookingRepo.save(booking);

    await this.historyRepo.save(this.historyRepo.create({
      bookingId: id,
      fromStatus: old,
      toStatus: newStatus,
      note,
      changedBy: userId,
    }));

    return saved;
  }

  private async generateBookingNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.bookingRepo.count();
    return `BK-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
}
