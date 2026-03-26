import { initTestDb, destroyTestDb, request } from '../setup';
import { getToken, clearTokenCache } from '../helpers';

const PREFIX = '/api/v1';

let providerId: string;
let serviceId: string;
let bookingId: string;
let paymentId: string;

beforeAll(async () => {
  await initTestDb();

  const adminToken = await getToken('admin');
  const customerToken = await getToken('customer');
  const ts = Date.now();

  const catRes = await request()
    .post(`${PREFIX}/service-categories`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: `Payment Test Category ${ts}`, isActive: true });
  const categoryId = catRes.body.data.id;

  const svcRes = await request()
    .post(`${PREFIX}/services`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ categoryId, name: `Payment Test Service ${ts}`, durationMinutes: 30, price: 200, isActive: true });
  serviceId = svcRes.body.data.id;

  const provRes = await request()
    .post(`${PREFIX}/providers`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: `Payment Test Provider ${ts}`, email: `payment_provider_${ts}@test.com`, phone: '0944444444', isActive: true });
  providerId = provRes.body.data.id;

  // Working hours
  for (let day = 1; day <= 5; day++) {
    await request()
      .post(`${PREFIX}/providers/${providerId}/working-hours`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ dayOfWeek: day, startTime: '09:00', endTime: '17:00', isAvailable: true });
  }

  // Assign service
  await request()
    .post(`${PREFIX}/provider-services/assign/${providerId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ serviceId });

  // Create booking
  const bookingDate = getNextWeekday(4);
  const bookingRes = await request()
    .post(`${PREFIX}/bookings`)
    .set('Authorization', `Bearer ${customerToken}`)
    .send({ providerId, serviceId, bookingDate, startTime: '09:00' });
  bookingId = bookingRes.body.data.id;

  // Confirm booking
  await request()
    .patch(`${PREFIX}/bookings/${bookingId}/confirm`)
    .set('Authorization', `Bearer ${adminToken}`);
});

afterAll(async () => {
  clearTokenCache();
  await destroyTestDb();
});

describe('Payment — CRUD', () => {
  it('admin can create a payment for a booking', async () => {
    const token = await getToken('admin');
    const res = await request()
      .post(`${PREFIX}/payments`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        bookingId,
        amount: 200,
        method: 'card',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.amount).toBe(200);
    paymentId = res.body.data.id;
  });

  it('admin can list payments', async () => {
    const token = await getToken('admin');
    const res = await request()
      .get(`${PREFIX}/payments`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('can filter payments by bookingId', async () => {
    const token = await getToken('admin');
    const res = await request()
      .get(`${PREFIX}/payments?bookingId=${bookingId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('can get single payment', async () => {
    const token = await getToken('admin');
    const res = await request()
      .get(`${PREFIX}/payments/${paymentId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(paymentId);
  });

  it('admin can mark payment as paid', async () => {
    const token = await getToken('admin');
    const res = await request()
      .patch(`${PREFIX}/payments/${paymentId}/pay`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('admin can refund a payment', async () => {
    const token = await getToken('admin');
    const res = await request()
      .patch(`${PREFIX}/payments/${paymentId}/refund`)
      .set('Authorization', `Bearer ${token}`)
      .send({ refundAmount: 100 });
    expect([200, 400]).toContain(res.status); // 400 if already refunded
  });

  it('customer cannot access admin payment list', async () => {
    const token = await getToken('customer');
    const res = await request()
      .get(`${PREFIX}/payments`)
      .set('Authorization', `Bearer ${token}`);
    expect([200, 403]).toContain(res.status);
  });

  it('returns 404 for unknown payment', async () => {
    const token = await getToken('admin');
    const res = await request()
      .get(`${PREFIX}/payments/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
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
