import { AppDataSource } from '../../config/database.config';
import { Reservation } from './entities/reservation.entity';
import { ReservationStatusHistory } from './entities/reservation-status-history.entity';
import { CreateReservationDto, UpdateReservationDto, CancelReservationDto, ReservationQueryDto } from './dto/reservation.dto';
import { NotFoundError, UnprocessableError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class ReservationService {
  private repo = AppDataSource.getRepository(Reservation);
  private historyRepo = AppDataSource.getRepository(ReservationStatusHistory);

  async findAll(query: ReservationQueryDto) {
    const { page = 1, limit = 10, search, status, date, tableId } = query;
    const qb = this.repo.createQueryBuilder('r').orderBy('r.reservationDate', 'DESC').addOrderBy('r.reservationTime', 'DESC').limit(limit).offset((page - 1) * limit);
    if (search) qb.where('r.customerName ILIKE :s OR r.customerPhone ILIKE :s', { s: `%${search}%` });
    if (status) qb.andWhere('r.status = :status', { status });
    if (date) qb.andWhere('r.reservationDate = :date', { date });
    if (tableId) qb.andWhere('r.tableId = :tableId', { tableId });
    const [reservations, total] = await qb.getManyAndCount();
    return { reservations, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string): Promise<Reservation> {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundError('Reservation');
    return r;
  }

  async create(dto: CreateReservationDto, userId?: string): Promise<Reservation> {
    const reservation = this.repo.create({ ...dto, customerId: userId, status: 'pending' });
    const saved = await this.repo.save(reservation);
    await this.addHistory(saved.id, null, 'pending', 'Reservation created', userId);
    return saved;
  }

  async update(id: string, dto: UpdateReservationDto): Promise<Reservation> {
    const r = await this.findById(id);
    Object.assign(r, dto);
    return this.repo.save(r);
  }

  async confirm(id: string, userId?: string): Promise<Reservation> {
    return this.changeStatus(id, 'confirmed', userId, 'Reservation confirmed');
  }

  async seat(id: string, userId?: string): Promise<Reservation> {
    return this.changeStatus(id, 'seated', userId, 'Customer seated');
  }

  async complete(id: string, userId?: string): Promise<Reservation> {
    return this.changeStatus(id, 'completed', userId, 'Reservation completed');
  }

  async cancel(id: string, dto: CancelReservationDto, userId?: string): Promise<Reservation> {
    const r = await this.findById(id);
    if (['completed', 'cancelled'].includes(r.status)) throw new UnprocessableError('Cannot cancel this reservation');
    const fromStatus = r.status;
    r.status = 'cancelled';
    r.cancelledAt = new Date();
    r.cancelReason = dto.reason || null;
    await this.repo.save(r);
    await this.addHistory(id, fromStatus, 'cancelled', dto.reason, userId);
    return r;
  }

  async noShow(id: string, userId?: string): Promise<Reservation> {
    return this.changeStatus(id, 'no_show', userId, 'Customer no show');
  }

  async getHistory(id: string) {
    await this.findById(id);
    return this.historyRepo.find({ where: { reservationId: id }, order: { createdAt: 'ASC' } });
  }

  async delete(id: string): Promise<void> {
    const r = await this.findById(id);
    await this.repo.remove(r);
  }

  private async changeStatus(id: string, toStatus: string, userId?: string, note?: string): Promise<Reservation> {
    const r = await this.findById(id);
    const fromStatus = r.status;
    r.status = toStatus;
    if (toStatus === 'confirmed') r.confirmedAt = new Date();
    await this.repo.save(r);
    await this.addHistory(id, fromStatus, toStatus, note, userId);
    return r;
  }

  private async addHistory(reservationId: string, fromStatus: string | null, toStatus: string, note?: string, changedBy?: string) {
    await this.historyRepo.save(this.historyRepo.create({ reservationId, fromStatus, toStatus, note, changedBy }));
  }
}
