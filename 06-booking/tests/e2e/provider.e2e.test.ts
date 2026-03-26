import { initTestDb, destroyTestDb, request } from '../setup';
import { getToken, clearTokenCache } from '../helpers';

const PREFIX = '/api/v1';
let providerId: string;
let serviceId: string;
let categoryId: string;

beforeAll(async () => {
  await initTestDb();

  const token = await getToken('admin');
  const ts = Date.now();

  const catRes = await request()
    .post(`${PREFIX}/service-categories`)
    .set('Authorization', `Bearer ${token}`)
    .send({ name: `Provider Test Category ${ts}`, isActive: true });
  categoryId = catRes.body.data.id;

  const svcRes = await request()
    .post(`${PREFIX}/services`)
    .set('Authorization', `Bearer ${token}`)
    .send({ categoryId, name: `Provider Test Service ${ts}`, durationMinutes: 45, price: 80, isActive: true });
  serviceId = svcRes.body.data.id;
});

afterAll(async () => {
  clearTokenCache();
  await destroyTestDb();
});

describe('Provider — CRUD', () => {
  it('public can list providers', async () => {
    const res = await request().get(`${PREFIX}/providers`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('admin can create a provider', async () => {
    const token = await getToken('admin');
    const ts = Date.now();
    const res = await request()
      .post(`${PREFIX}/providers`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: `Test Provider E2E ${ts}`,
        email: `testprovider_${ts}@test.com`,
        phone: '0901234567',
        bio: 'E2E test provider',
        isActive: true,
      });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toContain('Test Provider E2E');
    providerId = res.body.data.id;
  });

  it('can fetch provider by id', async () => {
    const res = await request().get(`${PREFIX}/providers/${providerId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(providerId);
  });

  it('admin can update a provider', async () => {
    const token = await getToken('admin');
    const res = await request()
      .put(`${PREFIX}/providers/${providerId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ bio: 'Updated bio' });
    expect(res.status).toBe(200);
    expect(res.body.data.bio).toBe('Updated bio');
  });

  it('customer cannot create a provider', async () => {
    const token = await getToken('customer');
    const res = await request()
      .post(`${PREFIX}/providers`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Unauthorized Provider', email: 'unauth@test.com', phone: '0000000000' });
    expect(res.status).toBe(403);
  });

  it('returns 404 for unknown provider', async () => {
    const res = await request().get(`${PREFIX}/providers/00000000-0000-0000-0000-000000000000`);
    expect(res.status).toBe(404);
  });
});

describe('Provider — Working Hours', () => {
  it('admin can set working hours for provider', async () => {
    const token = await getToken('admin');
    const res = await request()
      .post(`${PREFIX}/providers/${providerId}/working-hours`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
      });
    expect([200, 201]).toContain(res.status);
  });

  it('can get working hours for provider', async () => {
    const res = await request().get(`${PREFIX}/providers/${providerId}/working-hours`);
    expect(res.status).toBe(200);
  });
});

describe('Provider — Breaks', () => {
  it('admin can add a break', async () => {
    const token = await getToken('admin');
    const res = await request()
      .post(`${PREFIX}/providers/${providerId}/breaks`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        dayOfWeek: 1,
        startTime: '12:00',
        endTime: '13:00',
        reason: 'Lunch',
      });
    expect([200, 201]).toContain(res.status);
  });

  it('can get breaks for provider', async () => {
    const res = await request().get(`${PREFIX}/providers/${providerId}/breaks`);
    expect(res.status).toBe(200);
  });
});

describe('ProviderService — Assignment', () => {
  it('admin can assign service to provider', async () => {
    const token = await getToken('admin');
    const res = await request()
      .post(`${PREFIX}/provider-services/assign/${providerId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ serviceId });
    expect([200, 201]).toContain(res.status);
  });

  it('can list provider-services by provider', async () => {
    const res = await request().get(`${PREFIX}/provider-services/by-provider/${providerId}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('can list provider-services by service', async () => {
    const res = await request().get(`${PREFIX}/provider-services/by-service/${serviceId}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('admin can remove service from provider', async () => {
    const token = await getToken('admin');
    const res = await request()
      .delete(`${PREFIX}/provider-services/remove/${providerId}/${serviceId}`)
      .set('Authorization', `Bearer ${token}`);
    expect([200, 204]).toContain(res.status);
  });
});
