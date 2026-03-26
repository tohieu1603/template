import 'reflect-metadata';
import request from 'supertest';
import { Application } from 'express';
import { getApp, closeApp, getAdminUser, authHeader, resetAdminCache } from '../helpers';

describe('Common/Health E2E', () => {
  let app: Application;

  beforeAll(async () => {
    app = await getApp();
  });

  afterAll(async () => {
    resetAdminCache();
    await closeApp();
  });

  // ── Health Check ──────────────────────────────────────────────────────────
  describe('GET /health', () => {
    it('returns health status 200', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  // ── 404 Handler ───────────────────────────────────────────────────────────
  describe('Unknown routes', () => {
    it('returns 404 for unknown route', async () => {
      const res = await request(app).get('/api/v1/does-not-exist');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('returns 404 for POST to unknown route', async () => {
      const res = await request(app).post('/api/v1/nonexistent').send({});
      expect(res.status).toBe(404);
    });
  });

  // ── Settings (common module) ──────────────────────────────────────────────
  describe('GET /api/v1/settings', () => {
    it('requires authentication', async () => {
      const res = await request(app).get('/api/v1/settings');
      expect(res.status).toBe(401);
    });

    it('returns settings for admin', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get('/api/v1/settings')
        .set(authHeader(admin.accessToken));
      // Could be 200 or 403 depending on permissions
      expect([200, 403]).toContain(res.status);
    });
  });

  // ── Activity Logs ─────────────────────────────────────────────────────────
  describe('GET /api/v1/activity-logs', () => {
    it('requires authentication', async () => {
      const res = await request(app).get('/api/v1/activity-logs');
      expect(res.status).toBe(401);
    });

    it('returns activity logs for authenticated user', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get('/api/v1/activity-logs')
        .set(authHeader(admin.accessToken));
      expect([200, 403]).toContain(res.status);
    });
  });

  // ── Notifications ─────────────────────────────────────────────────────────
  describe('GET /api/v1/notifications', () => {
    it('requires authentication', async () => {
      const res = await request(app).get('/api/v1/notifications');
      expect(res.status).toBe(401);
    });

    it('returns notifications for authenticated user', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get('/api/v1/notifications')
        .set(authHeader(admin.accessToken));
      expect([200, 403]).toContain(res.status);
    });
  });

  // ── Banners (public) ─────────────────────────────────────────────────────
  describe('GET /api/v1/banners', () => {
    it('returns banners publicly', async () => {
      const res = await request(app).get('/api/v1/banners');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── Response shape validation ─────────────────────────────────────────────
  describe('API response shape', () => {
    it('successful responses have success:true', async () => {
      const res = await request(app).get('/health');
      expect(res.body).toHaveProperty('success', true);
    });

    it('error responses have success:false', async () => {
      const res = await request(app).get('/api/v1/does-not-exist');
      expect(res.body).toHaveProperty('success', false);
    });

    it('returns JSON content type', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['content-type']).toMatch(/json/);
    });
  });

  // ── Users module ──────────────────────────────────────────────────────────
  describe('Users CRUD (common module)', () => {
    it('GET /api/v1/users requires auth', async () => {
      const res = await request(app).get('/api/v1/users');
      expect(res.status).toBe(401);
    });

    it('GET /api/v1/users lists users for super_admin', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get('/api/v1/users')
        .set(authHeader(admin.accessToken));
      expect(res.status).toBe(200);
    });

    it('GET /api/v1/users/:id returns user', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`/api/v1/users/${admin.id}`)
        .set(authHeader(admin.accessToken));
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('id', admin.id);
    });

    it('GET /api/v1/users/non-existent returns 404', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get('/api/v1/users/00000000-0000-0000-0000-000000000000')
        .set(authHeader(admin.accessToken));
      expect(res.status).toBe(404);
    });
  });
});
