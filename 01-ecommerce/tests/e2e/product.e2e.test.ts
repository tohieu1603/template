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

describe('Product E2E', () => {
  let adminToken: string;
  let categoryId: string;
  let brandId: string;
  let attributeId: string;
  let attributeValueId: string;
  let productId: string;
  let productSlug: string;
  let variantId: string;

  const ts = Date.now();

  beforeAll(async () => {
    adminToken = await getToken('admin');

    // Create dependency: category
    const catRes = await supertest(getApp())
      .post(`${API}/categories`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `ProdCat_${ts}`, isActive: true });
    categoryId = catRes.body.data.id;

    // Create dependency: brand
    const brandRes = await supertest(getApp())
      .post(`${API}/brands`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `ProdBrand_${ts}`, isActive: true });
    brandId = brandRes.body.data.id;

    // Create dependency: attribute with value
    const attrRes = await supertest(getApp())
      .post(`${API}/attributes`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Size_${ts}`,
        type: 'select',
        values: [{ value: 'M', sortOrder: 1 }, { value: 'L', sortOrder: 2 }],
      });
    attributeId = attrRes.body.data.id;
    attributeValueId = attrRes.body.data.values[0].id;
  });

  it('should create product with variants, attributes, and images', async () => {
    const res = await supertest(getApp())
      .post(`${API}/products`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId,
        brandId,
        name: `Test Product ${ts}`,
        sku: `PROD-${ts}`,
        basePrice: 99.99,
        status: 'active',
        isFeatured: true,
        description: 'A test product',
        variants: [
          {
            sku: `PROD-${ts}-VAR1`,
            price: 99.99,
            stockQuantity: 50,
            attributeValueIds: [attributeValueId],
            images: [{ url: 'https://example.com/img1.jpg', isPrimary: true }],
          },
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    productId = res.body.data.id;
    productSlug = res.body.data.slug;
  });

  it('should get product by ID with variants and images', async () => {
    const res = await supertest(getApp()).get(`${API}/products/${productId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', productId);
    expect(Array.isArray(res.body.data.variants)).toBe(true);
    expect(res.body.data.variants.length).toBeGreaterThan(0);
    variantId = res.body.data.variants[0].id;
  });

  it('should get product by slug', async () => {
    const res = await supertest(getApp()).get(`${API}/products/slug/${productSlug}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('slug', productSlug);
  });

  it('should list products with pagination', async () => {
    const res = await supertest(getApp()).get(`${API}/products?page=1&limit=10`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('meta');
  });

  it('should list products filtered by status', async () => {
    const res = await supertest(getApp()).get(`${API}/products?status=active`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    res.body.data.forEach((p: any) => expect(p.status).toBe('active'));
  });

  it('should list products filtered by categoryId', async () => {
    const res = await supertest(getApp()).get(`${API}/products?categoryId=${categoryId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should list products filtered by featured', async () => {
    const res = await supertest(getApp()).get(`${API}/products?featured=true`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should list products with search', async () => {
    const res = await supertest(getApp()).get(`${API}/products?search=Test+Product`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should add variant to existing product', async () => {
    const res = await supertest(getApp())
      .post(`${API}/products/${productId}/variants`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        sku: `PROD-${ts}-VAR2`,
        price: 109.99,
        stockQuantity: 20,
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
  });

  it('should update product', async () => {
    const res = await supertest(getApp())
      .put(`${API}/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Updated product description', basePrice: 89.99 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('description', 'Updated product description');
  });

  it('should return 409 on duplicate SKU', async () => {
    const res = await supertest(getApp())
      .post(`${API}/products`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId,
        name: `Another Product ${ts}`,
        sku: `PROD-${ts}`, // same SKU
        basePrice: 50,
        variants: [],
      });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should return 409 on duplicate slug', async () => {
    const res = await supertest(getApp())
      .post(`${API}/products`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId,
        name: `Test Product ${ts}`, // same name => same generated slug
        sku: `UNIQUE-SKU-${ts}-X`,
        basePrice: 50,
        variants: [],
      });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should delete product', async () => {
    const res = await supertest(getApp())
      .delete(`${API}/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
