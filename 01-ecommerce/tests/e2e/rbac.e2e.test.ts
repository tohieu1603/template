import 'reflect-metadata';
import supertest from 'supertest';
import { getApp, initTestDb, destroyTestDb } from '../setup';
import { getToken, clearTokenCache } from '../helpers';

const API = '/api/v1';

beforeAll(async () => {
  await initTestDb();
});

afterAll(async () => {
  clearTokenCache();
  await destroyTestDb();
});

describe('RBAC E2E', () => {
  describe('No token — 401 on all protected routes', () => {
    it('GET /products (public — ok without token)', async () => {
      const res = await supertest(getApp()).get(`${API}/products`);
      expect(res.status).toBe(200);
    });

    it('POST /products requires auth', async () => {
      const res = await supertest(getApp()).post(`${API}/products`).send({});
      expect(res.status).toBe(401);
    });

    it('GET /users requires auth', async () => {
      const res = await supertest(getApp()).get(`${API}/users`);
      expect(res.status).toBe(401);
    });

    it('GET /settings requires auth', async () => {
      const res = await supertest(getApp()).get(`${API}/settings`);
      expect(res.status).toBe(401);
    });

    it('GET /activity-logs requires auth', async () => {
      const res = await supertest(getApp()).get(`${API}/activity-logs`);
      expect(res.status).toBe(401);
    });
  });

  describe('Customer — limited access', () => {
    let token: string;

    beforeAll(async () => {
      token = await getToken('customer');
    });

    it('cannot create product (403)', async () => {
      const res = await supertest(getApp())
        .post(`${API}/products`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Hacked', sku: 'HACK001', basePrice: 10, categoryId: '00000000-0000-0000-0000-000000000000' });
      expect([403, 422]).toContain(res.status);
    });

    it('cannot create category (403)', async () => {
      const res = await supertest(getApp())
        .post(`${API}/categories`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'HackedCat' });
      expect(res.status).toBe(403);
    });

    it('cannot create brand (403)', async () => {
      const res = await supertest(getApp())
        .post(`${API}/brands`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'HackedBrand' });
      expect(res.status).toBe(403);
    });

    it('cannot create coupon (403)', async () => {
      const res = await supertest(getApp())
        .post(`${API}/coupons`)
        .set('Authorization', `Bearer ${token}`)
        .send({ code: 'HACK10', type: 'percent', value: 10 });
      expect(res.status).toBe(403);
    });

    it('cannot list users (403)', async () => {
      const res = await supertest(getApp())
        .get(`${API}/users`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('cannot list settings (403)', async () => {
      const res = await supertest(getApp())
        .get(`${API}/settings`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('cannot list activity-logs (403)', async () => {
      const res = await supertest(getApp())
        .get(`${API}/activity-logs`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });
  });

  describe('Staff — view-only access', () => {
    let token: string;

    beforeAll(async () => {
      token = await getToken('staff');
    });

    it('can list products', async () => {
      const res = await supertest(getApp())
        .get(`${API}/products`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it('cannot create product (403)', async () => {
      const res = await supertest(getApp())
        .post(`${API}/products`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'StaffProduct', sku: 'STAFF001', basePrice: 20, categoryId: '00000000-0000-0000-0000-000000000000' });
      expect([403, 422]).toContain(res.status);
    });
  });

  describe('Admin — full access', () => {
    let token: string;

    beforeAll(async () => {
      token = await getToken('admin');
    });

    it('can list users', async () => {
      const res = await supertest(getApp())
        .get(`${API}/users`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('can list settings', async () => {
      const res = await supertest(getApp())
        .get(`${API}/settings`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('can list activity-logs', async () => {
      const res = await supertest(getApp())
        .get(`${API}/activity-logs`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
