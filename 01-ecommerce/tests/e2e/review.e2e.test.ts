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

describe('Review E2E', () => {
  let adminToken: string;
  let customerToken: string;
  let productId: string;
  let reviewId: string;

  const ts = Date.now();

  beforeAll(async () => {
    adminToken = await getToken('admin');
    customerToken = await getToken('customer');

    // Create product for reviews
    const catRes = await supertest(getApp())
      .post(`${API}/categories`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `ReviewCat_${ts}`, isActive: true });
    const categoryId = catRes.body.data.id;

    const prodRes = await supertest(getApp())
      .post(`${API}/products`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId,
        name: `ReviewProduct_${ts}`,
        sku: `REV-PROD-${ts}`,
        basePrice: 59.99,
        status: 'active',
        variants: [{ sku: `REV-VAR-${ts}`, price: 59.99, stockQuantity: 20 }],
      });
    productId = prodRes.body.data.id;
  });

  it('should create review', async () => {
    const res = await supertest(getApp())
      .post(`${API}/reviews`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId,
        rating: 5,
        title: 'Great product!',
        comment: 'Really loved this item, would buy again.',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('rating', 5);
    reviewId = res.body.data.id;
  });

  it('should list reviews for product', async () => {
    const res = await supertest(getApp()).get(`${API}/reviews?productId=${productId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should get review by ID', async () => {
    const res = await supertest(getApp()).get(`${API}/reviews/${reviewId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', reviewId);
  });

  it('should get product review stats', async () => {
    const res = await supertest(getApp()).get(`${API}/reviews/stats/${productId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('average_rating');
    expect(res.body.data).toHaveProperty('total_reviews');
  });

  it('customer should update own review', async () => {
    const res = await supertest(getApp())
      .put(`${API}/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ rating: 4, comment: 'Updated comment' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('rating', 4);
  });

  it('admin should moderate review (mark as verified)', async () => {
    const res = await supertest(getApp())
      .patch(`${API}/reviews/${reviewId}/admin`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isVerified: true, isVisible: true });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('customer should delete own review', async () => {
    const res = await supertest(getApp())
      .delete(`${API}/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
