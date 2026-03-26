import 'reflect-metadata';
import supertest from 'supertest';
import { getApp, initTestDb, destroyTestDb } from '../setup';
import { getToken, clearTokenCache } from '../helpers';

const API = '/api/v1/brands';

beforeAll(async () => {
  await initTestDb();
});

afterAll(async () => {
  clearTokenCache();
  await destroyTestDb();
});

describe('Brand E2E', () => {
  let adminToken: string;
  let brandId: string;

  beforeAll(async () => {
    adminToken = await getToken('admin');
  });

  it('should create brand (admin)', async () => {
    const res = await supertest(getApp())
      .post(API)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `Nike_${Date.now()}`, description: 'Sports brand', isActive: true });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    brandId = res.body.data.id;
  });

  it('should list brands', async () => {
    const res = await supertest(getApp()).get(API);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should list brands with pagination', async () => {
    const res = await supertest(getApp()).get(`${API}?page=1&limit=5`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('meta');
  });

  it('should get brand by ID', async () => {
    const res = await supertest(getApp()).get(`${API}/${brandId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', brandId);
  });

  it('should update brand', async () => {
    const res = await supertest(getApp())
      .put(`${API}/${brandId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Updated brand description' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('description', 'Updated brand description');
  });

  it('should return 404 for non-existent brand', async () => {
    const res = await supertest(getApp()).get(`${API}/00000000-0000-0000-0000-000000000000`);
    expect(res.status).toBe(404);
  });

  it('should delete brand', async () => {
    const res = await supertest(getApp())
      .delete(`${API}/${brandId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
