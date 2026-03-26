import { initTestDb, destroyTestDb, request } from '../setup';
import { getToken, clearTokenCache } from '../helpers';

const PREFIX = '/api/v1';

beforeAll(async () => {
  await initTestDb();
});

afterAll(async () => {
  clearTokenCache();
  await destroyTestDb();
});

describe('RBAC — Roles', () => {
  it('admin can list roles', async () => {
    const token = await getToken('admin');
    const res = await request()
      .get(`${PREFIX}/roles`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('customer cannot list roles (403)', async () => {
    const token = await getToken('customer');
    const res = await request()
      .get(`${PREFIX}/roles`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('unauthenticated cannot list roles (401)', async () => {
    const res = await request().get(`${PREFIX}/roles`);
    expect(res.status).toBe(401);
  });

  it('admin can create a role', async () => {
    const token = await getToken('admin');
    const ts = Date.now();
    const res = await request()
      .post(`${PREFIX}/roles`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `test_role_${ts}`, displayName: `Test Role ${ts}`, description: 'For RBAC tests' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toContain('test_role_');
  });

  it('admin can list permissions', async () => {
    const token = await getToken('admin');
    const res = await request()
      .get(`${PREFIX}/roles/permissions`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('RBAC — Users', () => {
  it('admin can list users', async () => {
    const token = await getToken('admin');
    const res = await request()
      .get(`${PREFIX}/users`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.meta).toBeDefined();
  });

  it('staff cannot delete users', async () => {
    const adminToken = await getToken('admin');
    const ts = Date.now();
    const createRes = await request()
      .post(`${PREFIX}/users`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: `deleteme_${ts}@test.com`, password: 'Delete@123', fullName: 'Delete Me' });
    expect(createRes.status).toBe(201);
    const userId = createRes.body.data.id;

    const staffToken = await getToken('staff');
    const delRes = await request()
      .delete(`${PREFIX}/users/${userId}`)
      .set('Authorization', `Bearer ${staffToken}`);
    expect(delRes.status).toBe(403);
  });

  it('super_admin bypasses RBAC', async () => {
    const token = await getToken('admin');
    const res = await request()
      .get(`${PREFIX}/users`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('customer cannot list users (403)', async () => {
    const token = await getToken('customer');
    const res = await request()
      .get(`${PREFIX}/users`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});

describe('RBAC — Protected booking routes', () => {
  it('customer cannot confirm a booking', async () => {
    const token = await getToken('customer');
    const res = await request()
      .patch(`${PREFIX}/bookings/00000000-0000-0000-0000-000000000000/confirm`)
      .set('Authorization', `Bearer ${token}`);
    expect([403, 404]).toContain(res.status);
  });

  it('no token returns 401 on protected routes', async () => {
    const res = await request().get(`${PREFIX}/users`);
    expect(res.status).toBe(401);
  });
});
