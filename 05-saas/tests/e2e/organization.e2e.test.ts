import 'reflect-metadata';
import request from 'supertest';
import { Application } from 'express';
import { getApp, closeApp, getAdminUser, registerAndLogin, authHeader, resetAdminCache } from '../helpers';

const BASE = '/api/v1/organizations';

describe('Organization E2E', () => {
  let app: Application;
  let createdOrgId: string;

  beforeAll(async () => {
    app = await getApp();
  });

  afterAll(async () => {
    resetAdminCache();
    await closeApp();
  });

  // ── Create ────────────────────────────────────────────────────────────────
  describe('POST /organizations', () => {
    it('creates an organization with valid data', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(BASE)
        .set(authHeader(admin.accessToken))
        .send({ name: `Org ${Date.now()}`, slug: `org-${Date.now()}`, industry: 'tech', size: '1-10' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      createdOrgId = res.body.data.id || res.body.data.organization?.id;
    });

    it('creates organization with minimal required fields', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(BASE)
        .set(authHeader(admin.accessToken))
        .send({ name: `Minimal Org ${Date.now()}` });

      expect(res.status).toBe(201);
    });

    it('returns 400 when name is missing', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(BASE)
        .set(authHeader(admin.accessToken))
        .send({ slug: 'no-name' });

      expect(res.status).toBe(400);
    });

    it('returns 400 with invalid size value', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(BASE)
        .set(authHeader(admin.accessToken))
        .send({ name: 'Bad Size', size: 'huge' });

      expect(res.status).toBe(400);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).post(BASE).send({ name: 'Unauth' });
      expect(res.status).toBe(401);
    });
  });

  // ── List ──────────────────────────────────────────────────────────────────
  describe('GET /organizations', () => {
    it('lists organizations for admin', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(BASE)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('supports pagination params', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`${BASE}?page=1&limit=5`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
    });

    it('supports industry filter', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`${BASE}?industry=tech`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
    });
  });

  // ── My Orgs ───────────────────────────────────────────────────────────────
  describe('GET /organizations/my', () => {
    it('returns orgs that the user belongs to', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`${BASE}/my`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get(`${BASE}/my`);
      expect(res.status).toBe(401);
    });
  });

  // ── Get One ───────────────────────────────────────────────────────────────
  describe('GET /organizations/:id', () => {
    it('returns organization by id', async () => {
      if (!createdOrgId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`${BASE}/${createdOrgId}`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('id', createdOrgId);
    });

    it('returns 404 for non-existent org', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`${BASE}/00000000-0000-0000-0000-000000000000`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(404);
    });
  });

  // ── Update ────────────────────────────────────────────────────────────────
  describe('PUT /organizations/:id', () => {
    it('updates organization fields', async () => {
      if (!createdOrgId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .put(`${BASE}/${createdOrgId}`)
        .set(authHeader(admin.accessToken))
        .send({ name: 'Updated Org Name', industry: 'fintech', size: '11-50' });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('name', 'Updated Org Name');
    });

    it('returns 400 with invalid size in update', async () => {
      if (!createdOrgId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .put(`${BASE}/${createdOrgId}`)
        .set(authHeader(admin.accessToken))
        .send({ size: 'invalid_size' });

      expect(res.status).toBe(400);
    });

    it('returns 401 without token', async () => {
      const res = await request(app)
        .put(`${BASE}/some-id`)
        .send({ name: 'Nope' });
      expect(res.status).toBe(401);
    });
  });

  // ── Delete ────────────────────────────────────────────────────────────────
  describe('DELETE /organizations/:id', () => {
    it('deletes an organization', async () => {
      const admin = await getAdminUser(app);
      // Create a temp org to delete
      const createRes = await request(app)
        .post(BASE)
        .set(authHeader(admin.accessToken))
        .send({ name: `To Delete ${Date.now()}` });
      const tempId = createRes.body.data?.id || createRes.body.data?.organization?.id;

      const res = await request(app)
        .delete(`${BASE}/${tempId}`)
        .set(authHeader(admin.accessToken));

      expect([200, 204]).toContain(res.status);
    });

    it('returns 403 for regular user', async () => {
      const user = await registerAndLogin(app, '_orgdel');
      const res = await request(app)
        .delete(`${BASE}/00000000-0000-0000-0000-000000000000`)
        .set(authHeader(user.accessToken));

      expect(res.status).toBe(403);
    });
  });
});
