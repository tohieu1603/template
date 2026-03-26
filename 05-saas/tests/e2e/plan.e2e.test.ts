import 'reflect-metadata';
import request from 'supertest';
import { Application } from 'express';
import { getApp, closeApp, getAdminUser, registerAndLogin, authHeader, resetAdminCache } from '../helpers';

const BASE = '/api/v1/plans';

describe('Plan E2E', () => {
  let app: Application;
  let createdPlanId: string;
  let createdFeatureIdInPlan: string;

  beforeAll(async () => {
    app = await getApp();
  });

  afterAll(async () => {
    resetAdminCache();
    await closeApp();
  });

  // ── List Plans (public) ───────────────────────────────────────────────────
  describe('GET /plans (public)', () => {
    it('lists plans without authentication', async () => {
      const res = await request(app).get(BASE);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('supports isActive filter', async () => {
      const res = await request(app).get(`${BASE}?isActive=true`);
      expect(res.status).toBe(200);
    });

    it('supports pagination', async () => {
      const res = await request(app).get(`${BASE}?page=1&limit=2`);
      expect(res.status).toBe(200);
    });
  });

  // ── Create Plan ───────────────────────────────────────────────────────────
  describe('POST /plans', () => {
    it('creates a plan (admin only)', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(BASE)
        .set(authHeader(admin.accessToken))
        .send({
          name: `Test Plan ${Date.now()}`,
          slug: `test-plan-${Date.now()}`,
          description: 'A test plan',
          priceMonthly: 19,
          priceYearly: 190,
          currency: 'USD',
          trialDays: 7,
          isPopular: false,
          sortOrder: 99,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      createdPlanId = res.body.data?.id || res.body.data?.plan?.id;
    });

    it('creates a plan with features array', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(BASE)
        .set(authHeader(admin.accessToken))
        .send({
          name: `Plan With Features ${Date.now()}`,
          priceMonthly: 29,
          features: [
            { featureKey: 'max_projects', featureName: 'Max Projects', value: '5', valueType: 'number', sortOrder: 0 },
          ],
        });

      expect(res.status).toBe(201);
    });

    it('returns 400 when name is missing', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(BASE)
        .set(authHeader(admin.accessToken))
        .send({ priceMonthly: 10 });

      expect(res.status).toBe(400);
    });

    it('returns 403 for regular user', async () => {
      const user = await registerAndLogin(app, '_plan_create');
      const res = await request(app)
        .post(BASE)
        .set(authHeader(user.accessToken))
        .send({ name: 'Hacker Plan' });

      expect(res.status).toBe(403);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).post(BASE).send({ name: 'No Auth' });
      expect(res.status).toBe(401);
    });
  });

  // ── Get Plan ──────────────────────────────────────────────────────────────
  describe('GET /plans/:id', () => {
    it('returns plan by id', async () => {
      if (!createdPlanId) return;
      const res = await request(app).get(`${BASE}/${createdPlanId}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('id', createdPlanId);
    });

    it('returns 404 for non-existent plan', async () => {
      const res = await request(app).get(`${BASE}/00000000-0000-0000-0000-000000000000`);
      expect(res.status).toBe(404);
    });
  });

  // ── Update Plan ───────────────────────────────────────────────────────────
  describe('PUT /plans/:id', () => {
    it('updates a plan', async () => {
      if (!createdPlanId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .put(`${BASE}/${createdPlanId}`)
        .set(authHeader(admin.accessToken))
        .send({ name: 'Updated Plan', priceMonthly: 25, isPopular: true });

      expect(res.status).toBe(200);
    });

    it('returns 403 for regular user', async () => {
      if (!createdPlanId) return;
      const user = await registerAndLogin(app, '_plan_update');
      const res = await request(app)
        .put(`${BASE}/${createdPlanId}`)
        .set(authHeader(user.accessToken))
        .send({ name: 'Hack' });

      expect(res.status).toBe(403);
    });
  });

  // ── Plan Features ─────────────────────────────────────────────────────────
  describe('POST /plans/:id/features', () => {
    it('adds a feature to the plan', async () => {
      if (!createdPlanId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(`${BASE}/${createdPlanId}/features`)
        .set(authHeader(admin.accessToken))
        .send({
          featureKey: 'storage_gb',
          featureName: 'Storage GB',
          value: '50',
          valueType: 'number',
          sortOrder: 0,
        });

      expect([200, 201]).toContain(res.status);
      createdFeatureIdInPlan = res.body.data?.id || res.body.data?.feature?.id;
    });

    it('returns 400 when featureKey is missing', async () => {
      if (!createdPlanId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(`${BASE}/${createdPlanId}/features`)
        .set(authHeader(admin.accessToken))
        .send({ featureName: 'No Key', value: '10' });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /plans/:id/features/:featureId', () => {
    it('removes a feature from the plan', async () => {
      if (!createdPlanId || !createdFeatureIdInPlan) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .delete(`${BASE}/${createdPlanId}/features/${createdFeatureIdInPlan}`)
        .set(authHeader(admin.accessToken));

      expect([200, 204]).toContain(res.status);
    });
  });

  // ── Delete Plan ───────────────────────────────────────────────────────────
  describe('DELETE /plans/:id', () => {
    it('deletes a plan', async () => {
      if (!createdPlanId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .delete(`${BASE}/${createdPlanId}`)
        .set(authHeader(admin.accessToken));

      expect([200, 204]).toContain(res.status);
    });

    it('returns 403 for regular user', async () => {
      const user = await registerAndLogin(app, '_plan_del');
      const res = await request(app)
        .delete(`${BASE}/00000000-0000-0000-0000-000000000000`)
        .set(authHeader(user.accessToken));

      expect(res.status).toBe(403);
    });
  });
});
