import 'reflect-metadata';
import request from 'supertest';
import { Application } from 'express';
import { getApp, closeApp, getAdminUser, registerAndLogin, authHeader, resetAdminCache } from '../helpers';

const BASE = '/api/v1/features';

describe('Feature E2E', () => {
  let app: Application;
  let createdFeatureId: string;
  let orgId: string;

  beforeAll(async () => {
    app = await getApp();
    const admin = await getAdminUser(app);
    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set(authHeader(admin.accessToken))
      .send({ name: `Feature Test Org ${Date.now()}` });
    orgId = orgRes.body.data?.id || orgRes.body.data?.organization?.id;
  });

  afterAll(async () => {
    resetAdminCache();
    await closeApp();
  });

  // ── Create Feature ────────────────────────────────────────────────────────
  describe('POST /features', () => {
    it('creates a feature flag (admin only)', async () => {
      const admin = await getAdminUser(app);
      const uniqueKey = `test_feature_${Date.now()}`;
      const res = await request(app)
        .post(BASE)
        .set(authHeader(admin.accessToken))
        .send({
          key: uniqueKey,
          name: 'Test Feature',
          description: 'A test feature flag',
          isEnabled: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      createdFeatureId = res.body.data?.id || res.body.data?.feature?.id;
    });

    it('creates feature without optional fields', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(BASE)
        .set(authHeader(admin.accessToken))
        .send({ key: `min_feature_${Date.now()}`, name: 'Minimal Feature' });

      expect(res.status).toBe(201);
    });

    it('returns 400 when key is missing', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(BASE)
        .set(authHeader(admin.accessToken))
        .send({ name: 'No Key Feature' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when name is missing', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(BASE)
        .set(authHeader(admin.accessToken))
        .send({ key: 'no_name_feature' });

      expect(res.status).toBe(400);
    });

    it('returns 403 for regular user', async () => {
      const user = await registerAndLogin(app, '_feat_create');
      const res = await request(app)
        .post(BASE)
        .set(authHeader(user.accessToken))
        .send({ key: 'hack_feature', name: 'Hack' });

      expect(res.status).toBe(403);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).post(BASE).send({ key: 'unauth', name: 'Unauth' });
      expect(res.status).toBe(401);
    });
  });

  // ── List Features ─────────────────────────────────────────────────────────
  describe('GET /features', () => {
    it('lists features (requires auth)', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(BASE)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('supports pagination', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`${BASE}?page=1&limit=5`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get(BASE);
      expect(res.status).toBe(401);
    });
  });

  // ── Get Feature ───────────────────────────────────────────────────────────
  describe('GET /features/:id', () => {
    it('returns feature by id', async () => {
      if (!createdFeatureId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`${BASE}/${createdFeatureId}`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('id', createdFeatureId);
    });

    it('returns 404 for non-existent feature', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`${BASE}/00000000-0000-0000-0000-000000000000`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(404);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get(`${BASE}/some-id`);
      expect(res.status).toBe(401);
    });
  });

  // ── Update Feature ────────────────────────────────────────────────────────
  describe('PUT /features/:id', () => {
    it('updates a feature flag', async () => {
      if (!createdFeatureId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .put(`${BASE}/${createdFeatureId}`)
        .set(authHeader(admin.accessToken))
        .send({ name: 'Updated Feature', description: 'Updated desc', isEnabled: false });

      expect(res.status).toBe(200);
    });

    it('returns 403 for regular user', async () => {
      if (!createdFeatureId) return;
      const user = await registerAndLogin(app, '_feat_upd');
      const res = await request(app)
        .put(`${BASE}/${createdFeatureId}`)
        .set(authHeader(user.accessToken))
        .send({ name: 'Hack Update' });

      expect(res.status).toBe(403);
    });
  });

  // ── Org Feature Overrides ─────────────────────────────────────────────────
  describe('GET /features/org/:orgId', () => {
    it('returns org feature overrides', async () => {
      if (!orgId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`${BASE}/org/${orgId}`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get(`${BASE}/org/${orgId}`);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /features/org/:orgId', () => {
    it('sets org feature override', async () => {
      if (!orgId || !createdFeatureId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(`${BASE}/org/${orgId}`)
        .set(authHeader(admin.accessToken))
        .send({ featureId: createdFeatureId, isEnabled: true });

      expect([200, 201]).toContain(res.status);
    });

    it('returns 400 when featureId is not a UUID', async () => {
      if (!orgId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(`${BASE}/org/${orgId}`)
        .set(authHeader(admin.accessToken))
        .send({ featureId: 'not-a-uuid', isEnabled: true });

      expect(res.status).toBe(400);
    });

    it('returns 400 when isEnabled is missing', async () => {
      if (!orgId || !createdFeatureId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(`${BASE}/org/${orgId}`)
        .set(authHeader(admin.accessToken))
        .send({ featureId: createdFeatureId });

      expect(res.status).toBe(400);
    });

    it('returns 401 without token', async () => {
      const res = await request(app)
        .post(`${BASE}/org/${orgId}`)
        .send({ featureId: createdFeatureId, isEnabled: true });
      expect(res.status).toBe(401);
    });
  });

  // ── Delete Feature ────────────────────────────────────────────────────────
  describe('DELETE /features/:id', () => {
    it('deletes a feature', async () => {
      if (!createdFeatureId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .delete(`${BASE}/${createdFeatureId}`)
        .set(authHeader(admin.accessToken));

      expect([200, 204]).toContain(res.status);
    });

    it('returns 403 for regular user', async () => {
      const user = await registerAndLogin(app, '_feat_del');
      const res = await request(app)
        .delete(`${BASE}/00000000-0000-0000-0000-000000000000`)
        .set(authHeader(user.accessToken));

      expect(res.status).toBe(403);
    });
  });
});
