import 'reflect-metadata';
import request from 'supertest';
import { Application } from 'express';
import { AppDataSource } from '../../src/config/database.config';
import { getApp, closeApp, getAdminUser, authHeader, resetAdminCache } from '../helpers';

describe('Invoice E2E', () => {
  let app: Application;
  let orgId: string;
  let invoiceId: string;

  beforeAll(async () => {
    app = await getApp();
    const admin = await getAdminUser(app);

    // Create org
    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set(authHeader(admin.accessToken))
      .send({ name: `Invoice Test Org ${Date.now()}` });
    orgId = orgRes.body.data?.id || orgRes.body.data?.organization?.id;

    // Create a plan and subscription to generate an invoice
    const planRes = await request(app)
      .post('/api/v1/plans')
      .set(authHeader(admin.accessToken))
      .send({ name: `Invoice Plan ${Date.now()}`, slug: `inv-plan-${Date.now()}`, priceMonthly: 29 });
    const planId = planRes.body.data?.id || planRes.body.data?.plan?.id;

    if (planId) {
      await request(app)
        .post(`/api/v1/organizations/${orgId}/subscriptions`)
        .set(authHeader(admin.accessToken))
        .send({ planId, billingCycle: 'monthly' });
    }

    // Try to get an invoice from DB directly
    const invoices = await AppDataSource.query(
      `SELECT id FROM invoices WHERE organization_id = $1 LIMIT 1`,
      [orgId],
    );
    if (invoices.length) {
      invoiceId = invoices[0].id;
    } else {
      // Manually insert test invoice with all required fields
      const invNum = `INV-TEST-${Date.now()}`;
      const result = await AppDataSource.query(
        `INSERT INTO invoices (id, organization_id, invoice_number, amount, tax_amount, total, currency, status, due_date, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, 29.00, 0.00, 29.00, 'USD', 'pending', NOW() + interval '7 days', NOW(), NOW())
         RETURNING id`,
        [orgId, invNum],
      );
      invoiceId = result[0]?.id;
    }
  });

  afterAll(async () => {
    resetAdminCache();
    await closeApp();
  });

  const base = () => `/api/v1/organizations/${orgId}/invoices`;

  // ── List Invoices ─────────────────────────────────────────────────────────
  describe('GET /organizations/:orgId/invoices', () => {
    it('lists invoices', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(base())
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('filters by status', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`${base()}?status=pending`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
    });

    it('supports pagination', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`${base()}?page=1&limit=10`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get(base());
      expect(res.status).toBe(401);
    });
  });

  // ── Get Invoice ───────────────────────────────────────────────────────────
  describe('GET /organizations/:orgId/invoices/:id', () => {
    it('returns invoice by id', async () => {
      if (!invoiceId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`${base()}/${invoiceId}`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('id', invoiceId);
    });

    it('returns 404 for non-existent invoice', async () => {
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

  // ── Mark Paid ─────────────────────────────────────────────────────────────
  describe('PATCH /organizations/:orgId/invoices/:id/mark-paid', () => {
    it('marks invoice as paid', async () => {
      if (!invoiceId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .patch(`${base()}/${invoiceId}/mark-paid`)
        .set(authHeader(admin.accessToken))
        .send({});

      expect([200, 204]).toContain(res.status);
    });

    it('accepts optional pdfUrl', async () => {
      // Create another invoice
      const admin = await getAdminUser(app);
      const newInvNum = `INV-TEST2-${Date.now()}`;
      const result = await AppDataSource.query(
        `INSERT INTO invoices (id, organization_id, invoice_number, amount, tax_amount, total, currency, status, due_date, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, 19.00, 0.00, 19.00, 'USD', 'pending', NOW() + interval '7 days', NOW(), NOW())
         RETURNING id`,
        [orgId, newInvNum],
      );
      const newInvoiceId = result[0]?.id;
      if (!newInvoiceId) return;

      const res = await request(app)
        .patch(`${base()}/${newInvoiceId}/mark-paid`)
        .set(authHeader(admin.accessToken))
        .send({ pdfUrl: 'https://example.com/invoice.pdf' });

      expect([200, 204]).toContain(res.status);
    });

    it('returns 404 for non-existent invoice', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .patch(`${base()}/00000000-0000-0000-0000-000000000000/mark-paid`)
        .set(authHeader(admin.accessToken))
        .send({});

      expect(res.status).toBe(404);
    });

    it('returns 401 without token', async () => {
      const res = await request(app)
        .patch(`${base()}/some-id/mark-paid`)
        .send({});
      expect(res.status).toBe(401);
    });
  });
});
