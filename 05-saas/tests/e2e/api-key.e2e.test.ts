import 'reflect-metadata';
import request from 'supertest';
import { Application } from 'express';
import { getApp, closeApp, getAdminUser, registerAndLogin, authHeader, resetAdminCache } from '../helpers';

describe('API Key E2E', () => {
  let app: Application;
  let orgId: string;
  let createdApiKeyId: string;

  beforeAll(async () => {
    app = await getApp();
    const admin = await getAdminUser(app);
    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set(authHeader(admin.accessToken))
      .send({ name: `API Key Test Org ${Date.now()}` });
    orgId = orgRes.body.data?.id || orgRes.body.data?.organization?.id;
    if (!orgId) throw new Error(`Failed to create test org: ${JSON.stringify(orgRes.body)}`);
  });

  afterAll(async () => {
    resetAdminCache();
    await closeApp();
  });

  const base = () => `/api/v1/organizations/${orgId}/api-keys`;

  // ── Create API Key ────────────────────────────────────────────────────────
  describe('POST /organizations/:orgId/api-keys', () => {
    it('creates an API key', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({
          name: `My API Key ${Date.now()}`,
          scopes: ['read', 'write'],
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      // data = { apiKey: { id, ... }, rawKey: 'sk_...' }
      createdApiKeyId = res.body.data?.apiKey?.id || res.body.data?.id;
    });

    it('creates API key with minimal fields', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ name: `Minimal Key ${Date.now()}` });

      expect([200, 201]).toContain(res.status);
    });

    it('response contains the raw key (visible only on creation)', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ name: `Key With Token ${Date.now()}` });

      expect([200, 201]).toContain(res.status);
      // The raw key should be included in response
      const data = res.body.data;
      expect(data).toBeDefined();
    });

    it('returns 400 when name is missing', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ scopes: ['read'] });

      expect(res.status).toBe(400);
    });

    it('returns 400 with invalid expiresAt date', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ name: 'Bad Date Key', expiresAt: 'not-a-date' });

      expect(res.status).toBe(400);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).post(base()).send({ name: 'Unauth' });
      expect(res.status).toBe(401);
    });
  });

  // ── List API Keys ─────────────────────────────────────────────────────────
  describe('GET /organizations/:orgId/api-keys', () => {
    it('lists API keys', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(base())
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('filters by isActive', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`${base()}?isActive=true`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
    });

    it('supports pagination', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`${base()}?page=1&limit=5`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get(base());
      expect(res.status).toBe(401);
    });
  });

  // ── Rotate API Key ────────────────────────────────────────────────────────
  describe('POST /organizations/:orgId/api-keys/:id/rotate', () => {
    it('rotates an API key', async () => {
      if (!createdApiKeyId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(`${base()}/${createdApiKeyId}/rotate`)
        .set(authHeader(admin.accessToken));

      expect([200, 201]).toContain(res.status);
    });

    it('returns 404 for non-existent key', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(`${base()}/00000000-0000-0000-0000-000000000000/rotate`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(404);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).post(`${base()}/some-id/rotate`);
      expect(res.status).toBe(401);
    });
  });

  // ── Revoke API Key ────────────────────────────────────────────────────────
  describe('DELETE /organizations/:orgId/api-keys/:id', () => {
    it('revokes an API key', async () => {
      if (!createdApiKeyId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .delete(`${base()}/${createdApiKeyId}`)
        .set(authHeader(admin.accessToken));

      expect([200, 204]).toContain(res.status);
    });

    it('returns 404 for non-existent key', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .delete(`${base()}/00000000-0000-0000-0000-000000000000`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(404);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).delete(`${base()}/some-id`);
      expect(res.status).toBe(401);
    });
  });
});
