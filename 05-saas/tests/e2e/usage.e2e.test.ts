import 'reflect-metadata';
import request from 'supertest';
import { Application } from 'express';
import { getApp, closeApp, getAdminUser, authHeader, resetAdminCache } from '../helpers';

describe('Usage E2E', () => {
  let app: Application;
  let orgId: string;

  beforeAll(async () => {
    app = await getApp();
    const admin = await getAdminUser(app);
    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set(authHeader(admin.accessToken))
      .send({ name: `Usage Test Org ${Date.now()}` });
    orgId = orgRes.body.data?.id || orgRes.body.data?.organization?.id;
    if (!orgId) throw new Error(`Failed to create test org: ${JSON.stringify(orgRes.body)}`);
  });

  afterAll(async () => {
    resetAdminCache();
    await closeApp();
  });

  const base = () => `/api/v1/organizations/${orgId}/usage`;

  // ── Record Usage ──────────────────────────────────────────────────────────
  describe('POST /organizations/:orgId/usage', () => {
    it('records usage for a feature', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({
          featureKey: 'api_calls',
          quantity: 100,
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
    });

    it('records usage with period dates', async () => {
      const admin = await getAdminUser(app);
      const now = new Date();
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({
          featureKey: 'storage_gb',
          quantity: 5,
          periodStart: now.toISOString(),
          periodEnd: monthEnd.toISOString(),
        });

      expect([200, 201]).toContain(res.status);
    });

    it('returns 400 when featureKey is missing', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ quantity: 10 });

      expect(res.status).toBe(400);
    });

    it('returns 400 when quantity is missing', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ featureKey: 'api_calls' });

      expect(res.status).toBe(400);
    });

    it('returns 400 with invalid periodStart date', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ featureKey: 'api_calls', quantity: 1, periodStart: 'not-a-date' });

      expect(res.status).toBe(400);
    });

    it('returns 401 without token', async () => {
      const res = await request(app)
        .post(base())
        .send({ featureKey: 'api_calls', quantity: 1 });
      expect(res.status).toBe(401);
    });
  });

  // ── Get Current Period Usage ──────────────────────────────────────────────
  describe('GET /organizations/:orgId/usage/current', () => {
    it('returns current period usage', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`${base()}/current`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get(`${base()}/current`);
      expect(res.status).toBe(401);
    });
  });

  // ── Get Usage History ─────────────────────────────────────────────────────
  describe('GET /organizations/:orgId/usage/history', () => {
    it('returns usage history', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`${base()}/history`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('filters usage history by featureKey', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`${base()}/history?featureKey=api_calls`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
    });

    it('supports pagination', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`${base()}/history?page=1&limit=5`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get(`${base()}/history`);
      expect(res.status).toBe(401);
    });
  });
});
