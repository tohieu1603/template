import { initTestDb, destroyTestDb, request } from '../setup';
import { getToken, clearTokenCache } from '../helpers';

const PREFIX = '/api/v1';

let providerId: string;
let serviceId: string;
let bookingId: string;
let reviewId: string;

beforeAll(async () => {
  await initTestDb();

  const adminToken = await getToken('admin');
  const customerToken = await getToken('customer');
  const ts = Date.now();

  const catRes = await request()
    .post(`${PREFIX}/service-categories`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: `Review Test Category ${ts}`, isActive: true });
  const categoryId = catRes.body.data.id;

  const svcRes = await request()
    .post(`${PREFIX}/services`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ categoryId, name: `Review Test Service ${ts}`, durationMinutes: 30, price: 60, isActive: true });
  serviceId = svcRes.body.data.id;

  const provRes = await request()
    .post(`${PREFIX}/providers`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: `Review Test Provider ${ts}`, email: `review_provider_${ts}@test.com`, phone: '0933333333', isActive: true });
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

  // Create, confirm and complete a booking
  const bookingDate = getNextWeekday(3);
  const bookingRes = await request()
    .post(`${PREFIX}/bookings`)
    .set('Authorization', `Bearer ${customerToken}`)
    .send({ providerId, serviceId, bookingDate, startTime: '09:00' });
  bookingId = bookingRes.body.data.id;

  await request()
    .patch(`${PREFIX}/bookings/${bookingId}/confirm`)
    .set('Authorization', `Bearer ${adminToken}`);
  await request()
    .patch(`${PREFIX}/bookings/${bookingId}/complete`)
    .set('Authorization', `Bearer ${adminToken}`);
});

afterAll(async () => {
  clearTokenCache();
  await destroyTestDb();
});

describe('Review — CRUD', () => {
  it('customer can leave a review for completed booking', async () => {
    const token = await getToken('customer');
    const res = await request()
      .post(`${PREFIX}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        bookingId,
        rating: 5,
        comment: 'Excellent service! E2E test.',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.rating).toBe(5);
    reviewId = res.body.data.id;
  });

  it('can list reviews publicly', async () => {
    const res = await request().get(`${PREFIX}/reviews`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('can filter reviews by providerId', async () => {
    const res = await request().get(`${PREFIX}/reviews?providerId=${providerId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('can get single review', async () => {
    const res = await request().get(`${PREFIX}/reviews/${reviewId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(reviewId);
  });

  it('admin can reply to a review', async () => {
    const token = await getToken('admin');
    const res = await request()
      .post(`${PREFIX}/reviews/${reviewId}/reply`)
      .set('Authorization', `Bearer ${token}`)
      .send({ adminReply: 'Thank you for your feedback!' });
    expect(res.status).toBe(200);
  });

  it('customer cannot review twice for same booking', async () => {
    const token = await getToken('customer');
    const res = await request()
      .post(`${PREFIX}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        bookingId,
        rating: 4,
        comment: 'Second review attempt',
      });
    expect(res.status).toBe(409);
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
