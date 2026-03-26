import { initTestDb, destroyTestDb, request } from '../setup';
import { getToken, clearTokenCache } from '../helpers';

const PREFIX = '/api/v1';
let categoryId: string;
let serviceId: string;

beforeAll(async () => {
  await initTestDb();

  const token = await getToken('admin');
  const ts = Date.now();
  const catRes = await request()
    .post(`${PREFIX}/service-categories`)
    .set('Authorization', `Bearer ${token}`)
    .send({ name: `Service Test Category ${ts}`, description: 'For service e2e', isActive: true });
  categoryId = catRes.body.data.id;
});

afterAll(async () => {
  clearTokenCache();
  await destroyTestDb();
});

describe('Service — CRUD', () => {
  it('public can list services', async () => {
    const res = await request().get(`${PREFIX}/services`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('admin can create a service', async () => {
    const token = await getToken('admin');
    const ts = Date.now();
    const res = await request()
      .post(`${PREFIX}/services`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        categoryId,
        name: `Test Service E2E ${ts}`,
        description: 'Service for e2e tests',
        durationMinutes: 60,
        price: 100,
        isActive: true,
      });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toContain('Test Service E2E');
    expect(res.body.data.durationMinutes).toBe(60);
    serviceId = res.body.data.id;
  });

  it('can fetch service by id', async () => {
    const res = await request().get(`${PREFIX}/services/${serviceId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(serviceId);
  });

  it('can filter services by category', async () => {
    const res = await request().get(`${PREFIX}/services?categoryId=${categoryId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('admin can update a service', async () => {
    const token = await getToken('admin');
    const res = await request()
      .put(`${PREFIX}/services/${serviceId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `Test Service Updated ${Date.now()}`, price: 120 });
    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(120);
  });

  it('customer cannot create a service', async () => {
    const token = await getToken('customer');
    const res = await request()
      .post(`${PREFIX}/services`)
      .set('Authorization', `Bearer ${token}`)
      .send({ categoryId, name: 'Unauthorized', durationMinutes: 30, price: 50 });
    expect(res.status).toBe(403);
  });

  it('returns 404 for unknown service', async () => {
    const res = await request().get(`${PREFIX}/services/00000000-0000-0000-0000-000000000000`);
    expect(res.status).toBe(404);
  });

  it('admin can delete a service', async () => {
    const token = await getToken('admin');
    const res = await request()
      .delete(`${PREFIX}/services/${serviceId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
