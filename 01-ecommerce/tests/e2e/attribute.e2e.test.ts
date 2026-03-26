import 'reflect-metadata';
import supertest from 'supertest';
import { getApp, initTestDb, destroyTestDb } from '../setup';
import { getToken, clearTokenCache } from '../helpers';

const API = '/api/v1/attributes';

beforeAll(async () => {
  await initTestDb();
});

afterAll(async () => {
  clearTokenCache();
  await destroyTestDb();
});

describe('Attribute E2E', () => {
  let adminToken: string;
  let attributeId: string;
  let valueId: string;

  beforeAll(async () => {
    adminToken = await getToken('admin');
  });

  it('should create attribute with values (admin)', async () => {
    const res = await supertest(getApp())
      .post(API)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Color_${Date.now()}`,
        type: 'color',
        values: [
          { value: 'Red', colorHex: '#FF0000', sortOrder: 1 },
          { value: 'Blue', colorHex: '#0000FF', sortOrder: 2 },
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    attributeId = res.body.data.id;
  });

  it('should list attributes', async () => {
    const res = await supertest(getApp()).get(API);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should get attribute by ID with values', async () => {
    const res = await supertest(getApp()).get(`${API}/${attributeId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', attributeId);
    expect(Array.isArray(res.body.data.values)).toBe(true);
  });

  it('should update attribute', async () => {
    const res = await supertest(getApp())
      .put(`${API}/${attributeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ sortOrder: 5 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should add attribute value', async () => {
    const res = await supertest(getApp())
      .post(`${API}/${attributeId}/values`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ value: 'Green', colorHex: '#00FF00' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    valueId = res.body.data.id;
  });

  it('should delete attribute value', async () => {
    const res = await supertest(getApp())
      .delete(`${API}/${attributeId}/values/${valueId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should delete attribute', async () => {
    const res = await supertest(getApp())
      .delete(`${API}/${attributeId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
