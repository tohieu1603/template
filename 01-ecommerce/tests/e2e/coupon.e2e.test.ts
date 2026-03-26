import 'reflect-metadata';
import supertest from 'supertest';
import { getApp, initTestDb, destroyTestDb } from '../setup';
import { getToken, clearTokenCache } from '../helpers';

const API = '/api/v1/coupons';

beforeAll(async () => {
  await initTestDb();
});

afterAll(async () => {
  clearTokenCache();
  await destroyTestDb();
});

describe('Coupon E2E', () => {
  let adminToken: string;
  let customerToken: string;
  let couponId: string;

  const ts = Date.now();
  const couponCode = `TEST10_${ts}`;

  beforeAll(async () => {
    adminToken = await getToken('admin');
    customerToken = await getToken('customer');
  });

  it('admin should create coupon', async () => {
    const res = await supertest(getApp())
      .post(API)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        code: couponCode,
        type: 'percent',
        value: 10,
        minOrderAmount: 50,
        isActive: true,
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('code', couponCode);
    couponId = res.body.data.id;
  });

  it('admin should list coupons', async () => {
    const res = await supertest(getApp())
      .get(API)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('admin should get coupon by ID', async () => {
    const res = await supertest(getApp())
      .get(`${API}/${couponId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', couponId);
  });

  it('admin should update coupon', async () => {
    const res = await supertest(getApp())
      .put(`${API}/${couponId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ minOrderAmount: 100 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('authenticated user should apply coupon', async () => {
    const res = await supertest(getApp())
      .post(`${API}/apply`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ code: couponCode, orderAmount: 200 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('discount');
    expect(res.body.data.discount).toBeGreaterThan(0);
  });

  it('should fail applying coupon with order below minimum', async () => {
    const res = await supertest(getApp())
      .post(`${API}/apply`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ code: couponCode, orderAmount: 50 }); // below updated minOrderAmount of 100
    // Either 400 (validation) or discount=0 depending on implementation
    if (res.status === 200) {
      expect(res.body.data.discount).toBe(0);
    } else {
      expect([400, 422]).toContain(res.status);
    }
  });

  it('admin should delete coupon', async () => {
    const res = await supertest(getApp())
      .delete(`${API}/${couponId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
