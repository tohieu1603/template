import 'reflect-metadata';
import supertest from 'supertest';
import { getApp, initTestDb, destroyTestDb } from '../setup';
import { getToken, clearTokenCache } from '../helpers';

const API = '/api/v1/addresses';

beforeAll(async () => {
  await initTestDb();
});

afterAll(async () => {
  clearTokenCache();
  await destroyTestDb();
});

describe('Address E2E', () => {
  let customerToken: string;
  let addressId: string;

  beforeAll(async () => {
    customerToken = await getToken('customer');
  });

  it('should require auth', async () => {
    const res = await supertest(getApp()).get(API);
    expect(res.status).toBe(401);
  });

  it('should list addresses (initially empty or existing)', async () => {
    const res = await supertest(getApp())
      .get(API)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should create address', async () => {
    const res = await supertest(getApp())
      .post(API)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        recipientName: 'John Doe',
        phone: '0901234567',
        province: 'Ho Chi Minh City',
        district: 'District 1',
        ward: 'Ben Nghe Ward',
        streetAddress: '123 Nguyen Hue Street',
        label: 'Home',
        isDefault: true,
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('recipientName', 'John Doe');
    addressId = res.body.data.id;
  });

  it('should get address by ID', async () => {
    const res = await supertest(getApp())
      .get(`${API}/${addressId}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', addressId);
  });

  it('should update address', async () => {
    const res = await supertest(getApp())
      .put(`${API}/${addressId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ streetAddress: '456 Nguyen Hue Street' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('streetAddress', '456 Nguyen Hue Street');
  });

  it('should set address as default', async () => {
    const res = await supertest(getApp())
      .patch(`${API}/${addressId}/default`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should delete address', async () => {
    const res = await supertest(getApp())
      .delete(`${API}/${addressId}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for deleted address', async () => {
    const res = await supertest(getApp())
      .get(`${API}/${addressId}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(404);
  });
});
