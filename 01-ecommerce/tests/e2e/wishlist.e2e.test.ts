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

describe('Wishlist E2E', () => {
  let adminToken: string;
  let customerToken: string;
  let productId: string;

  const ts = Date.now();

  beforeAll(async () => {
    adminToken = await getToken('admin');
    customerToken = await getToken('customer');

    const catRes = await supertest(getApp())
      .post(`${API}/categories`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `WishCat_${ts}`, isActive: true });
    const categoryId = catRes.body.data.id;

    const prodRes = await supertest(getApp())
      .post(`${API}/products`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId,
        name: `WishProduct_${ts}`,
        sku: `WISH-PROD-${ts}`,
        basePrice: 39.99,
        status: 'active',
        variants: [{ sku: `WISH-VAR-${ts}`, price: 39.99, stockQuantity: 30 }],
      });
    productId = prodRes.body.data.id;
  });

  it('should require auth to access wishlist', async () => {
    const res = await supertest(getApp()).get(`${API}/wishlist`);
    expect(res.status).toBe(401);
  });

  it('should get empty wishlist', async () => {
    const res = await supertest(getApp())
      .get(`${API}/wishlist`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should toggle wishlist (add product)', async () => {
    const res = await supertest(getApp())
      .post(`${API}/wishlist/${productId}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Usually returns { wishlisted: true } or the wishlist item
  });

  it('should check if product is wishlisted', async () => {
    const res = await supertest(getApp())
      .get(`${API}/wishlist/${productId}/check`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('isWishlisted', true);
  });

  it('should get wishlist with product', async () => {
    const res = await supertest(getApp())
      .get(`${API}/wishlist`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should toggle wishlist (remove product)', async () => {
    const res = await supertest(getApp())
      .post(`${API}/wishlist/${productId}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should confirm product removed from wishlist', async () => {
    const res = await supertest(getApp())
      .get(`${API}/wishlist/${productId}/check`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('isWishlisted', false);
  });
});
