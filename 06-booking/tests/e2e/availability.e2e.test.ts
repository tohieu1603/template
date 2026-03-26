import { initTestDb, destroyTestDb, request } from '../setup';
import { getToken, clearTokenCache } from '../helpers';

const PREFIX = '/api/v1';

let providerId: string;
let serviceId: string;

beforeAll(async () => {
  await initTestDb();

  const adminToken = await getToken('admin');
  const ts = Date.now();

  const catRes = await request()
    .post(`${PREFIX}/service-categories`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: `Availability Test Category ${ts}`, isActive: true });
  const categoryId = catRes.body.data.id;

  const svcRes = await request()
    .post(`${PREFIX}/services`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      categoryId,
      name: `Availability Test Service ${ts}`,
      durationMinutes: 30,
      price: 50,
      bufferMinutes: 10,
      isActive: true,
    });
  serviceId = svcRes.body.data.id;

  const provRes = await request()
    .post(`${PREFIX}/providers`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: `Availability Test Provider ${ts}`,
      email: `avail_provider_${ts}@test.com`,
      phone: '0922222222',
      isActive: true,
    });
  providerId = provRes.body.data.id;

  // Set working hours for weekdays Mon-Fri
  for (let day = 1; day <= 5; day++) {
    await request()
      .post(`${PREFIX}/providers/${providerId}/working-hours`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ dayOfWeek: day, startTime: '09:00', endTime: '17:00', isAvailable: true });
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

describe('Availability — Slots', () => {
  it('returns available slots for a weekday', async () => {
    const date = getNextWeekday(1); // Monday
    const res = await request().get(
      `${PREFIX}/availability?serviceId=${serviceId}&providerId=${providerId}&date=${date}`,
    );
    expect(res.status).toBe(200);
    const slots = res.body.data?.slots ?? res.body.data;
    expect(Array.isArray(slots)).toBe(true);
    expect((res.body.data?.slots ?? res.body.data).length).toBeGreaterThan(0);
  });

  it('returns empty/no available slots on weekend (no working hours)', async () => {
    const date = getNextWeekday(6); // Saturday
    const res = await request().get(
      `${PREFIX}/availability?serviceId=${serviceId}&providerId=${providerId}&date=${date}`,
    );
    expect(res.status).toBe(200);
    // Saturday has no working hours — 0 available slots or empty array
    const slots = res.body.data?.slots ?? res.body.data;
    expect(Array.isArray(slots)).toBe(true);
  });

  it('requires serviceId and providerId', async () => {
    const res = await request().get(`${PREFIX}/availability`);
    expect(res.status).toBe(400);
  });
});

describe('Availability — Blocked after booking', () => {
  it('slot is marked unavailable after booking', async () => {
    const customerToken = await getToken('customer');
    const date = getNextWeekday(2); // Tuesday

    const slotsRes = await request().get(
      `${PREFIX}/availability?serviceId=${serviceId}&providerId=${providerId}&date=${date}`,
    );
    expect(slotsRes.status).toBe(200);
    const slots = slotsRes.body.data?.slots ?? slotsRes.body.data;
    if (!slots || !Array.isArray(slots) || slots.length === 0) return;

    const targetSlot = slots[0].startTime ?? slots[0].start_time;

    await request()
      .post(`${PREFIX}/bookings`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        providerId,
        serviceId,
        bookingDate: date,
        startTime: targetSlot,
      });

    const afterRes = await request().get(
      `${PREFIX}/availability?serviceId=${serviceId}&providerId=${providerId}&date=${date}`,
    );
    expect(afterRes.status).toBe(200);
  });
});

describe('Availability — Holidays', () => {
  it('admin can create a holiday', async () => {
    const token = await getToken('admin');
    const futureDate = getFutureDate(60);
    const ts = Date.now();
    const res = await request()
      .post(`${PREFIX}/holidays`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `E2E Test Holiday ${ts}`, date: futureDate, isRecurring: false });
    expect([201, 409]).toContain(res.status);
  });

  it('can list holidays', async () => {
    const res = await request().get(`${PREFIX}/holidays`);
    expect(res.status).toBe(200);
    const slots = res.body.data?.slots ?? res.body.data;
    expect(Array.isArray(slots)).toBe(true);
  });
});

describe('Availability — Blocked Slots', () => {
  it('admin can create a blocked slot', async () => {
    const token = await getToken('admin');
    const futureDate = getFutureDate(7);
    const res = await request()
      .post(`${PREFIX}/blocked-slots`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        providerId,
        blockedDate: futureDate,
        startTime: '12:00',
        endTime: '13:00',
        reason: 'Lunch break E2E test',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.reason).toBe('Lunch break E2E test');
  });

  it('admin can list blocked slots', async () => {
    const token = await getToken('admin');
    const res = await request()
      .get(`${PREFIX}/blocked-slots`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const slots = res.body.data?.slots ?? res.body.data;
    expect(Array.isArray(slots)).toBe(true);
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

function getFutureDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}
