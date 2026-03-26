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

describe('Order E2E', () => {
  let adminToken: string;
  let customerToken: string;
  let variantId: string;
  let orderId: string;
  let cancelOrderId: string;

  const ts = Date.now();

  beforeAll(async () => {
    adminToken = await getToken('admin');
    customerToken = await getToken('customer');

    // Create category and product for orders
    const catRes = await supertest(getApp())
      .post(`${API}/categories`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `OrderCat_${ts}`, isActive: true });
    const categoryId = catRes.body.data.id;

    const prodRes = await supertest(getApp())
      .post(`${API}/products`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId,
        name: `OrderProduct_${ts}`,
        sku: `ORDER-PROD-${ts}`,
        basePrice: 79.99,
        status: 'active',
        variants: [{ sku: `ORDER-VAR-${ts}`, price: 79.99, stockQuantity: 100 }],
      });
    const product = await supertest(getApp()).get(`${API}/products/${prodRes.body.data.id}`);
    variantId = product.body.data.variants[0].id;
  });

  it('should create order from items', async () => {
    const res = await supertest(getApp())
      .post(`${API}/orders`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ variantId, quantity: 2 }],
        shippingName: 'Test Customer',
        shippingPhone: '0901234567',
        shippingAddress: '123 Test Street, Ho Chi Minh City',
        paymentMethod: 'cod',
        note: 'Please handle with care',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('status');
    orderId = res.body.data.id;

    // Create a second order for cancel test
    const res2 = await supertest(getApp())
      .post(`${API}/orders`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ variantId, quantity: 1 }],
        shippingName: 'Test Customer',
        shippingPhone: '0901234567',
        shippingAddress: '456 Cancel Street',
        paymentMethod: 'cod',
      });
    cancelOrderId = res2.body.data.id;
  });

  it('customer should see own orders', async () => {
    const res = await supertest(getApp())
      .get(`${API}/orders`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const found = res.body.data.find((o: any) => o.id === orderId);
    expect(found).toBeDefined();
  });

  it('admin should see all orders', async () => {
    const res = await supertest(getApp())
      .get(`${API}/orders`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should get order detail with items', async () => {
    const res = await supertest(getApp())
      .get(`${API}/orders/${orderId}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', orderId);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThan(0);
  });

  it('admin should update order status', async () => {
    const res = await supertest(getApp())
      .put(`${API}/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'confirmed', note: 'Order confirmed by admin' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('status', 'confirmed');
  });

  it('customer should cancel pending order', async () => {
    const res = await supertest(getApp())
      .post(`${API}/orders/${cancelOrderId}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
