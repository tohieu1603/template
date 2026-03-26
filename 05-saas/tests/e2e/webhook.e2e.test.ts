import 'reflect-metadata';
import request from 'supertest';
import { Application } from 'express';
import { getApp, closeApp, getAdminUser, authHeader, resetAdminCache } from '../helpers';

describe('Webhook E2E', () => {
  let app: Application;
  let orgId: string;
  let createdWebhookId: string;

  beforeAll(async () => {
    app = await getApp();
    const admin = await getAdminUser(app);
    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set(authHeader(admin.accessToken))
      .send({ name: `Webhook Test Org ${Date.now()}` });
    orgId = orgRes.body.data?.id || orgRes.body.data?.organization?.id;
    if (!orgId) throw new Error(`Failed to create test org: ${JSON.stringify(orgRes.body)}`);
  });

  afterAll(async () => {
    resetAdminCache();
    await closeApp();
  });

  const base = () => `/api/v1/organizations/${orgId}/webhooks`;

  // ── Create Webhook ────────────────────────────────────────────────────────
  describe('POST /organizations/:orgId/webhooks', () => {
    it('creates a webhook with valid url and events', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({
          url: 'https://example.com/webhook',
          events: ['subscription.created', 'invoice.paid'],
          isActive: true,
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      createdWebhookId = res.body.data?.id || res.body.data?.webhook?.id;
    });

    it('creates webhook with minimal required fields', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({
          url: 'https://example.com/webhook2',
          events: ['member.added'],
        });

      expect([200, 201]).toContain(res.status);
    });

    it('returns 400 with invalid url', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ url: 'not-a-url', events: ['test.event'] });

      expect(res.status).toBe(400);
    });

    it('returns 400 when url is missing', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ events: ['test.event'] });

      expect(res.status).toBe(400);
    });

    it('returns 400 when events is missing', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ url: 'https://example.com/hook' });

      expect(res.status).toBe(400);
    });

    it('returns 401 without token', async () => {
      const res = await request(app)
        .post(base())
        .send({ url: 'https://example.com', events: ['test'] });
      expect(res.status).toBe(401);
    });
  });

  // ── List Webhooks ─────────────────────────────────────────────────────────
  describe('GET /organizations/:orgId/webhooks', () => {
    it('lists webhooks', async () => {
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

  // ── Get Webhook ───────────────────────────────────────────────────────────
  describe('GET /organizations/:orgId/webhooks/:id', () => {
    it('returns webhook by id', async () => {
      if (!createdWebhookId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`${base()}/${createdWebhookId}`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('id', createdWebhookId);
    });

    it('returns 404 for non-existent webhook', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`${base()}/00000000-0000-0000-0000-000000000000`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(404);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get(`${base()}/some-id`);
      expect(res.status).toBe(401);
    });
  });

  // ── Update Webhook ────────────────────────────────────────────────────────
  describe('PUT /organizations/:orgId/webhooks/:id', () => {
    it('updates webhook url and events', async () => {
      if (!createdWebhookId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .put(`${base()}/${createdWebhookId}`)
        .set(authHeader(admin.accessToken))
        .send({
          url: 'https://example.com/updated-webhook',
          events: ['invoice.paid', 'member.removed'],
          isActive: false,
        });

      expect(res.status).toBe(200);
    });

    it('returns 400 with invalid url in update', async () => {
      if (!createdWebhookId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .put(`${base()}/${createdWebhookId}`)
        .set(authHeader(admin.accessToken))
        .send({ url: 'not-valid-url' });

      expect(res.status).toBe(400);
    });

    it('returns 401 without token', async () => {
      const res = await request(app)
        .put(`${base()}/some-id`)
        .send({ isActive: false });
      expect(res.status).toBe(401);
    });
  });

  // ── Webhook Logs ──────────────────────────────────────────────────────────
  describe('GET /organizations/:orgId/webhooks/:id/logs', () => {
    it('returns webhook logs', async () => {
      if (!createdWebhookId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`${base()}/${createdWebhookId}/logs`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
    });

    it('filters logs by success status', async () => {
      if (!createdWebhookId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`${base()}/${createdWebhookId}/logs?success=true`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get(`${base()}/some-id/logs`);
      expect(res.status).toBe(401);
    });
  });

  // ── Delete Webhook ────────────────────────────────────────────────────────
  describe('DELETE /organizations/:orgId/webhooks/:id', () => {
    it('deletes a webhook', async () => {
      if (!createdWebhookId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .delete(`${base()}/${createdWebhookId}`)
        .set(authHeader(admin.accessToken));

      expect([200, 204]).toContain(res.status);
    });

    it('returns 404 for non-existent webhook', async () => {
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
