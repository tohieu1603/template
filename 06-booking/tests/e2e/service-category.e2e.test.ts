import { initTestDb, destroyTestDb, request } from '../setup';
import { getToken, clearTokenCache } from '../helpers';

const PREFIX = '/api/v1';
let createdId: string;

beforeAll(async () => {
  await initTestDb();
});

afterAll(async () => {
  clearTokenCache();
  await destroyTestDb();
});

describe('ServiceCategory — CRUD', () => {
  it('public can list categories', async () => {
    const res = await request().get(`${PREFIX}/service-categories`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('admin can create a category', async () => {
    const token = await getToken('admin');
    const ts = Date.now();
    const res = await request()
      .post(`${PREFIX}/service-categories`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `Test Category E2E ${ts}`, description: 'Category for e2e tests', isActive: true });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toContain('Test Category E2E');
    createdId = res.body.data.id;
  });

  it('can fetch category by id', async () => {
    const res = await request().get(`${PREFIX}/service-categories/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdId);
  });

  it('admin can update a category', async () => {
    const token = await getToken('admin');
    const res = await request()
      .put(`${PREFIX}/service-categories/${createdId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `Test Category Updated ${Date.now()}`, isActive: true });
    expect(res.status).toBe(200);
  });

  it('customer cannot create a category', async () => {
    const token = await getToken('customer');
    const res = await request()
      .post(`${PREFIX}/service-categories`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Unauthorized Category', isActive: true });
    expect(res.status).toBe(403);
  });

  it('returns 404 for unknown category', async () => {
    const res = await request().get(`${PREFIX}/service-categories/00000000-0000-0000-0000-000000000000`);
    expect(res.status).toBe(404);
  });
});
