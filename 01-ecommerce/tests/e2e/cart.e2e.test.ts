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

describe('Cart E2E', () => {
  let customerToken: string;
  let customer2Token: string;
  let variantId: string;
  let outOfStockVariantId: string;
  let cartItemId: string;

  const ts = Date.now();

  beforeAll(async () => {
    customerToken = await getToken('customer');
    customer2Token = await getToken('customer2');
    const adminToken = await getToken('admin');

    // Create category for product
    const catRes = await supertest(getApp())
      .post(`${API}/categories`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `CartCat_${ts}`, isActive: true });
    const categoryId = catRes.body.data.id;

    // Create in-stock product variant
    const prodRes = await supertest(getApp())
      .post(`${API}/products`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId,
        name: `CartProduct_${ts}`,
        sku: `CART-PROD-${ts}`,
        basePrice: 49.99,
        status: 'active',
        variants: [
          { sku: `CART-VAR-${ts}`, price: 49.99, stockQuantity: 10 },
        ],
      });
    const product = await supertest(getApp()).get(`${API}/products/${prodRes.body.data.id}`);
    variantId = product.body.data.variants[0].id;

    // Create out-of-stock variant
    const outRes = await supertest(getApp())
      .post(`${API}/products`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId,
        name: `OutOfStock_${ts}`,
        sku: `OOS-PROD-${ts}`,
        basePrice: 29.99,
        status: 'active',
        variants: [
          { sku: `OOS-VAR-${ts}`, price: 29.99, stockQuantity: 0 },
        ],
      });
    const outProduct = await supertest(getApp()).get(`${API}/products/${outRes.body.data.id}`);
    outOfStockVariantId = outProduct.body.data.variants[0].id;

    // Clear any existing cart for customer
    await supertest(getApp())
      .delete(`${API}/cart`)
      .set('Authorization', `Bearer ${customerToken}`);
  });

  it('should add item to cart', async () => {
    const res = await supertest(getApp())
      .post(`${API}/cart`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ variantId, quantity: 2 });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('variantId', variantId);
    cartItemId = res.body.data.id;
  });

  it('should view cart with subtotal and items', async () => {
    const res = await supertest(getApp())
      .get(`${API}/cart`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('items');
    expect(res.body.data).toHaveProperty('subtotal');
    expect(res.body.data).toHaveProperty('itemCount');
    expect(res.body.data.items.length).toBeGreaterThan(0);
    expect(parseFloat(res.body.data.subtotal)).toBeGreaterThan(0);
  });

  it('should update cart item quantity by cartItemId', async () => {
    const res = await supertest(getApp())
      .put(`${API}/cart/${cartItemId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ quantity: 3 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should update cart item quantity by variantId', async () => {
    const res = await supertest(getApp())
      .put(`${API}/cart/${variantId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ quantity: 1 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should remove item from cart by variantId', async () => {
    // Re-add so we can remove
    await supertest(getApp())
      .post(`${API}/cart`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ variantId, quantity: 1 });

    const res = await supertest(getApp())
      .delete(`${API}/cart/${variantId}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify item gone
    const cartRes = await supertest(getApp())
      .get(`${API}/cart`)
      .set('Authorization', `Bearer ${customerToken}`);
    const stillThere = cartRes.body.data.items.find((i: any) => i.variant_id === variantId);
    expect(stillThere).toBeUndefined();
  });

  it('should fail to add out-of-stock item', async () => {
    const res = await supertest(getApp())
      .post(`${API}/cart`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ variantId: outOfStockVariantId, quantity: 1 });
    expect([400, 422]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it('cart should be isolated per user', async () => {
    // Add to customer1 cart
    await supertest(getApp())
      .post(`${API}/cart`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ variantId, quantity: 1 });

    // customer2 cart should be empty
    const res = await supertest(getApp())
      .get(`${API}/cart`)
      .set('Authorization', `Bearer ${customer2Token}`);
    expect(res.status).toBe(200);
    const customer2HasItem = res.body.data.items.find((i: any) => i.variant_id === variantId);
    expect(customer2HasItem).toBeUndefined();
  });

  it('should clear cart', async () => {
    const res = await supertest(getApp())
      .delete(`${API}/cart`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const cartRes = await supertest(getApp())
      .get(`${API}/cart`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(cartRes.body.data.itemCount).toBe(0);
  });
});
