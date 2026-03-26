import 'reflect-metadata';
import supertest from 'supertest';
import { getApp, initTestDb, destroyTestDb } from '../setup';
import { getToken, clearTokenCache } from '../helpers';

const API = '/api/v1/contacts';

beforeAll(async () => {
  await initTestDb();
});

afterAll(async () => {
  clearTokenCache();
  await destroyTestDb();
});

describe('Contact E2E', () => {
  let adminToken: string;
  let contactId: string;

  beforeAll(async () => {
    adminToken = await getToken('admin');
  });

  it('should submit contact form (public)', async () => {
    const res = await supertest(getApp())
      .post(API)
      .send({
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '0912345678',
        subject: 'Product inquiry',
        message: 'I would like to know more about your products.',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    contactId = res.body.data.id;
  });

  it('should fail contact submission with missing name', async () => {
    const res = await supertest(getApp())
      .post(API)
      .send({ email: 'test@test.com', message: 'Test message' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should fail contact submission with invalid email', async () => {
    const res = await supertest(getApp())
      .post(API)
      .send({ name: 'Test', email: 'not-an-email', message: 'Test message' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('admin should list contacts', async () => {
    const res = await supertest(getApp())
      .get(API)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('admin should get contact by ID', async () => {
    const res = await supertest(getApp())
      .get(`${API}/${contactId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', contactId);
  });

  it('admin should mark contact as read', async () => {
    const res = await supertest(getApp())
      .patch(`${API}/${contactId}/read`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('unauthenticated should not list contacts', async () => {
    const res = await supertest(getApp()).get(API);
    expect(res.status).toBe(401);
  });

  it('admin should delete contact', async () => {
    const res = await supertest(getApp())
      .delete(`${API}/${contactId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
