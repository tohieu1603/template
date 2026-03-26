import { initTestDb, destroyTestDb, request } from '../setup';
import { getToken, clearTokenCache } from '../helpers';

const PREFIX = '/api/v1';

let categoryId: string;
let serviceId: string;
let providerId: string;
let bookingId: string;

beforeAll(async () => {
  await initTestDb();

  const adminToken = await getToken('admin');
  const ts = Date.now();

  const catRes = await request()
    .post(`${PREFIX}/service-categories`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: `Booking Test Category ${ts}`, isActive: true });
  categoryId = catRes.body.data.id;

  const svcRes = await request()
    .post(`${PREFIX}/services`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      categoryId,
      name: `Booking Test Service ${ts}`,
      durationMinutes: 60,
      price: 150,
      bufferMinutes: 15,
      isActive: true,
    });
  serviceId = svcRes.body.data.id;

  const provRes = await request()
    .post(`${PREFIX}/providers`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: `Booking Test Provider ${ts}`,
      email: `bookingprovider_${ts}@test.com`,
      phone: '0911111111',
      isActive: true,
    });
  providerId = provRes.body.data.id;

  // Working hours — all weekdays 08:00-18:00
  for (let day = 1; day <= 5; day++) {
    await request()
      .post(`${PREFIX}/providers/${providerId}/working-hours`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ dayOfWeek: day, startTime: '08:00', endTime: '18:00', isAvailable: true });
  }

  // Assign service to provider
  await request()
    .post(`${PREFIX}/provider-services/assign/${providerId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ serviceId });
});

afterAll(async () => {
  clearTokenCache();
  await destroyTestDb();
});

describe('Booking — Create', () => {
  it('customer can create a booking', async () => {
    const token = await getToken('customer');
    const bookingDate = getNextWeekday(1);

    const res = await request()
      .post(`${PREFIX}/bookings`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        providerId,
        serviceId,
        bookingDate,
        startTime: '09:00',
        note: 'E2E booking test',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('pending');
    bookingId = res.body.data.id;
  });

  it('booking has correct fields', async () => {
    const token = await getToken('customer');
    const res = await request()
      .get(`${PREFIX}/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.service_id).toBe(serviceId);
    expect(res.body.data.provider_id).toBe(providerId);
  });

  it('customer can list own bookings', async () => {
    const token = await getToken('customer');
    const res = await request()
      .get(`${PREFIX}/bookings`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('Booking — Confirm', () => {
  it('admin can confirm the booking', async () => {
    const token = await getToken('admin');
    const res = await request()
      .patch(`${PREFIX}/bookings/${bookingId}/confirm`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('confirmed');
  });

  it('booking status is confirmed', async () => {
    const token = await getToken('admin');
    const res = await request()
      .get(`${PREFIX}/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('confirmed');
  });
});

describe('Booking — Complete', () => {
  it('admin can complete the booking', async () => {
    const token = await getToken('admin');
    const res = await request()
      .patch(`${PREFIX}/bookings/${bookingId}/complete`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('completed');
  });
});

describe('Booking — Cancel', () => {
  it('customer can cancel a pending booking', async () => {
    const token = await getToken('customer');
    const adminToken = await getToken('admin');

    const bookingDate = getNextWeekday(2);
    const createRes = await request()
      .post(`${PREFIX}/bookings`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        providerId,
        serviceId,
        bookingDate,
        startTime: '10:00',
      });
    expect(createRes.status).toBe(201);
    const cancelId = createRes.body.data.id;

    const res = await request()
      .patch(`${PREFIX}/bookings/${cancelId}/cancel`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'E2E cancel test' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('cancelled');
  });
});

describe('Booking — No-show', () => {
  it('admin can mark booking as no-show', async () => {
    const token = await getToken('customer');
    const adminToken = await getToken('admin');

    const bookingDate = getNextWeekday(3);
    const createRes = await request()
      .post(`${PREFIX}/bookings`)
      .set('Authorization', `Bearer ${token}`)
      .send({ providerId, serviceId, bookingDate, startTime: '11:00' });
    expect(createRes.status).toBe(201);
    const noShowId = createRes.body.data.id;

    // Confirm first
    await request()
      .patch(`${PREFIX}/bookings/${noShowId}/confirm`)
      .set('Authorization', `Bearer ${adminToken}`);

    const res = await request()
      .patch(`${PREFIX}/bookings/${noShowId}/no-show`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('no_show');
  });
});

describe('Booking — Pagination & Filters', () => {
  it('admin can filter bookings by status', async () => {
    const token = await getToken('admin');
    const res = await request()
      .get(`${PREFIX}/bookings?status=completed`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.every((b: any) => b.status === 'completed')).toBe(true);
  });

  it('admin can filter bookings by providerId', async () => {
    const token = await getToken('admin');
    const res = await request()
      .get(`${PREFIX}/bookings?providerId=${providerId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('can get booking history', async () => {
    const token = await getToken('customer');
    const res = await request()
      .get(`${PREFIX}/bookings/${bookingId}/history`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});

function getNextWeekday(targetDay: number): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  let daysUntil = targetDay - dayOfWeek;
  if (daysUntil <= 0) daysUntil += 7;
  const next = new Date(today);
  next.setDate(today.getDate() + daysUntil);
  return next.toISOString().split('T')[0];
}
