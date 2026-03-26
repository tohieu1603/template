import 'reflect-metadata';
import request from 'supertest';
import { Application } from 'express';
import { getApp, closeApp, getAdminUser, registerAndLogin, authHeader, resetAdminCache } from '../helpers';

describe('Payment Method E2E', () => {
  let app: Application;
  let orgId: string;
  let createdPaymentMethodId: string;

  beforeAll(async () => {
    app = await getApp();
    const admin = await getAdminUser(app);
    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set(authHeader(admin.accessToken))
      .send({ name: `PM Test Org ${Date.now()}` });
    orgId = orgRes.body.data?.id || orgRes.body.data?.organization?.id;
    if (!orgId) throw new Error(`Failed to create test org: ${JSON.stringify(orgRes.body)}`);
  });

  afterAll(async () => {
    resetAdminCache();
    await closeApp();
  });

  const base = () => `/api/v1/organizations/${orgId}/payment-methods`;

  // ── Add Payment Method ────────────────────────────────────────────────────
  describe('POST /organizations/:orgId/payment-methods', () => {
    it('adds a card payment method', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({
          type: 'card',
          brand: 'visa',
          lastFour: '4242',
          expMonth: 12,
          expYear: 2026,
          externalId: `pm_${Date.now()}`,
          isDefault: true,
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      createdPaymentMethodId = res.body.data?.id || res.body.data?.paymentMethod?.id;
    });

    it('adds a bank_transfer payment method', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ type: 'bank_transfer' });

      expect([200, 201]).toContain(res.status);
    });

    it('returns 400 with invalid type', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ type: 'crypto' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when type is missing', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ brand: 'visa', lastFour: '4242' });

      expect(res.status).toBe(400);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).post(base()).send({ type: 'card' });
      expect(res.status).toBe(401);
    });
  });

  // ── List Payment Methods ──────────────────────────────────────────────────
  describe('GET /organizations/:orgId/payment-methods', () => {
    it('lists payment methods', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(base())
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get(base());
      expect(res.status).toBe(401);
    });
  });

  // ── Set Default ───────────────────────────────────────────────────────────
  describe('PATCH /organizations/:orgId/payment-methods/:id/default', () => {
    it('sets a payment method as default', async () => {
      if (!createdPaymentMethodId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .patch(`${base()}/${createdPaymentMethodId}/default`)
        .set(authHeader(admin.accessToken));

      expect([200, 204]).toContain(res.status);
    });

    it('returns 404 for non-existent payment method', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .patch(`${base()}/00000000-0000-0000-0000-000000000000/default`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(404);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).patch(`${base()}/some-id/default`);
      expect(res.status).toBe(401);
    });
  });

  // ── Remove Payment Method ─────────────────────────────────────────────────
  describe('DELETE /organizations/:orgId/payment-methods/:id', () => {
    it('removes a payment method', async () => {
      if (!createdPaymentMethodId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .delete(`${base()}/${createdPaymentMethodId}`)
        .set(authHeader(admin.accessToken));

      expect([200, 204]).toContain(res.status);
    });

    it('returns 404 for non-existent payment method', async () => {
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
