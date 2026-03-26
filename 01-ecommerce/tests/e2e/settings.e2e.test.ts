import 'reflect-metadata';
import supertest from 'supertest';
import { getApp, initTestDb, destroyTestDb } from '../setup';
import { getToken, clearTokenCache } from '../helpers';

const API = '/api/v1/settings';

beforeAll(async () => {
  await initTestDb();
});

afterAll(async () => {
  clearTokenCache();
  await destroyTestDb();
});

describe('Settings E2E', () => {
  let adminToken: string;
  let customerToken: string;
  const testSettingKey = `test_setting_${Date.now()}`;

  beforeAll(async () => {
    adminToken = await getToken('admin');
    customerToken = await getToken('customer');
  });

  it('should get public settings without auth', async () => {
    const res = await supertest(getApp()).get(`${API}/public`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('admin should list all settings', async () => {
    const res = await supertest(getApp())
      .get(API)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('customer cannot list settings (403)', async () => {
    const res = await supertest(getApp())
      .get(API)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(403);
  });

  it('admin should create setting', async () => {
    const res = await supertest(getApp())
      .post(API)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ key: testSettingKey, value: 'test_value', type: 'string', groupName: 'test' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('key', testSettingKey);
  });

  it('admin should get setting by key', async () => {
    const res = await supertest(getApp())
      .get(`${API}/${testSettingKey}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('key', testSettingKey);
  });

  it('admin should update setting by key', async () => {
    const res = await supertest(getApp())
      .put(`${API}/${testSettingKey}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ value: 'updated_value' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('value', 'updated_value');
  });

  it('admin should bulk update settings', async () => {
    const res = await supertest(getApp())
      .put(`${API}/bulk`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ settings: [{ key: testSettingKey, value: 'bulk_updated' }] });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('admin should delete setting', async () => {
    const res = await supertest(getApp())
      .delete(`${API}/${testSettingKey}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
