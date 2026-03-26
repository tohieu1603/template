import 'reflect-metadata';
import supertest from 'supertest';
import { getApp, initTestDb, destroyTestDb } from '../setup';
import { getToken, clearTokenCache } from '../helpers';

const API = '/api/v1/categories';

beforeAll(async () => {
  await initTestDb();
});

afterAll(async () => {
  clearTokenCache();
  await destroyTestDb();
});

describe('Category E2E', () => {
  let adminToken: string;
  let createdCategoryId: string;
  let subCategoryId: string;

  beforeAll(async () => {
    adminToken = await getToken('admin');
  });

  it('should create a root category (admin)', async () => {
    const res = await supertest(getApp())
      .post(API)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `Electronics_${Date.now()}`, description: 'Electronic goods', isActive: true });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('name');
    createdCategoryId = res.body.data.id;
  });

  it('should create a sub-category with parentId', async () => {
    const res = await supertest(getApp())
      .post(API)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `Phones_${Date.now()}`, parentId: createdCategoryId, isActive: true });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('parentId', createdCategoryId);
    subCategoryId = res.body.data.id;
  });

  it('should GET /categories/tree returning nested structure', async () => {
    const res = await supertest(getApp()).get(`${API}/tree`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    // Find created parent category in tree
    const found = res.body.data.find((c: any) => c.id === createdCategoryId);
    expect(found).toBeDefined();
    expect(Array.isArray(found.children)).toBe(true);
  });

  it('should list categories with pagination', async () => {
    const res = await supertest(getApp()).get(`${API}?page=1&limit=5`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('meta');
  });

  it('should list categories with search', async () => {
    const res = await supertest(getApp()).get(`${API}?search=Electronics`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should get category by ID', async () => {
    const res = await supertest(getApp()).get(`${API}/${createdCategoryId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', createdCategoryId);
  });

  it('should update category', async () => {
    const res = await supertest(getApp())
      .put(`${API}/${createdCategoryId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Updated electronics description' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('description', 'Updated electronics description');
  });

  it('should delete sub-category', async () => {
    const res = await supertest(getApp())
      .delete(`${API}/${subCategoryId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should delete parent category', async () => {
    const res = await supertest(getApp())
      .delete(`${API}/${createdCategoryId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
