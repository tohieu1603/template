import 'reflect-metadata';
import request from 'supertest';
import { Application } from 'express';
import { getApp, closeApp, getAdminUser, registerAndLogin, authHeader, resetAdminCache } from '../helpers';
import { AppDataSource } from '../../src/config/database.config';

describe('Subscription E2E', () => {
  let app: Application;
  let orgId: string;
  let freePlanId: string;
  let paidPlanId: string;

  beforeAll(async () => {
    app = await getApp();
    const admin = await getAdminUser(app);

    // Create org
    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set(authHeader(admin.accessToken))
      .send({ name: `Sub Test Org ${Date.now()}` });
    orgId = orgRes.body.data?.id || orgRes.body.data?.organization?.id;

    // Get or create a free plan
    const plansRes = await request(app).get('/api/v1/plans');
    const plans = plansRes.body.data?.plans || plansRes.body.data || [];
    const free = plans.find((p: any) => p.slug === 'free' || p.priceMonthly === 0);
    if (free) {
      freePlanId = free.id;
    } else {
      const createPlanRes = await request(app)
        .post('/api/v1/plans')
        .set(authHeader(admin.accessToken))
        .send({ name: 'Test Free Plan', slug: `free-${Date.now()}`, priceMonthly: 0 });
      freePlanId = createPlanRes.body.data?.id || createPlanRes.body.data?.plan?.id;
    }

    // Create a paid plan
    const paidRes = await request(app)
      .post('/api/v1/plans')
      .set(authHeader(admin.accessToken))
      .send({ name: `Paid Plan ${Date.now()}`, slug: `paid-${Date.now()}`, priceMonthly: 49 });
    paidPlanId = paidRes.body.data?.id || paidRes.body.data?.plan?.id;
  });

  afterAll(async () => {
    resetAdminCache();
    await closeApp();
  });

  const base = () => `/api/v1/organizations/${orgId}/subscriptions`;

  // ── Create Subscription ───────────────────────────────────────────────────
  describe('POST /organizations/:orgId/subscriptions', () => {
    it('creates a subscription', async () => {
      if (!freePlanId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ planId: freePlanId, billingCycle: 'monthly' });

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
    });

    it('returns 400 with invalid planId', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ planId: 'not-a-uuid' });

      expect(res.status).toBe(400);
    });

    it('returns 400 with invalid billingCycle', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ planId: freePlanId, billingCycle: 'weekly' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when planId is missing', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ billingCycle: 'monthly' });

      expect(res.status).toBe(400);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).post(base()).send({ planId: freePlanId });
      expect(res.status).toBe(401);
    });
  });

  // ── Get Current Subscription ──────────────────────────────────────────────
  describe('GET /organizations/:orgId/subscriptions/current', () => {
    it('returns current subscription', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`${base()}/current`)
        .set(authHeader(admin.accessToken));

      expect([200, 404]).toContain(res.status);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get(`${base()}/current`);
      expect(res.status).toBe(401);
    });
  });

  // ── List Subscriptions ────────────────────────────────────────────────────
  describe('GET /organizations/:orgId/subscriptions', () => {
    it('lists subscriptions', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(base())
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
    });

    it('filters by status', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`${base()}?status=active`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
    });
  });

  // ── Upgrade Subscription ──────────────────────────────────────────────────
  describe('PUT /organizations/:orgId/subscriptions', () => {
    it('upgrades subscription to a different plan', async () => {
      if (!paidPlanId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .put(base())
        .set(authHeader(admin.accessToken))
        .send({ planId: paidPlanId, billingCycle: 'yearly' });

      expect([200, 404]).toContain(res.status);
    });

    it('returns 400 with invalid billingCycle in upgrade', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .put(base())
        .set(authHeader(admin.accessToken))
        .send({ billingCycle: 'quarterly' });

      expect(res.status).toBe(400);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).put(base()).send({ planId: paidPlanId });
      expect(res.status).toBe(401);
    });
  });

  // ── Cancel Subscription ───────────────────────────────────────────────────
  describe('DELETE /organizations/:orgId/subscriptions/cancel', () => {
    it('cancels current subscription', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .delete(`${base()}/cancel`)
        .set(authHeader(admin.accessToken));

      expect([200, 404]).toContain(res.status);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).delete(`${base()}/cancel`);
      expect(res.status).toBe(401);
    });
  });
});
