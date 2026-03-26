import 'reflect-metadata';
import request from 'supertest';
import { Application } from 'express';
import { AppDataSource } from '../../src/config/database.config';
import { getApp, closeApp, getAdminUser, registerAndLogin, authHeader, resetAdminCache } from '../helpers';

describe('Invitation E2E', () => {
  let app: Application;
  let orgId: string;
  let createdInvitationId: string;

  beforeAll(async () => {
    app = await getApp();
    const admin = await getAdminUser(app);
    const res = await request(app)
      .post('/api/v1/organizations')
      .set(authHeader(admin.accessToken))
      .send({ name: `Invitation Test Org ${Date.now()}` });

    orgId = res.body.data?.id || res.body.data?.organization?.id;
    if (!orgId) throw new Error(`Failed to create test org: ${JSON.stringify(res.body)}`);
  });

  afterAll(async () => {
    resetAdminCache();
    await closeApp();
  });

  const base = () => `/api/v1/organizations/${orgId}/invitations`;

  // ── Create Invitation ─────────────────────────────────────────────────────
  describe('POST /organizations/:orgId/invitations', () => {
    it('creates an invitation with valid email', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ email: `invite_${Date.now()}@test.com`, role: 'member' });

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      // data = invitation entity directly
      createdInvitationId = res.body.data?.id;
    });

    it('creates invitation without role (uses default)', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ email: `invite2_${Date.now()}@test.com` });

      expect([200, 201]).toContain(res.status);
    });

    it('returns 400 with invalid email', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ email: 'not-an-email' });

      expect(res.status).toBe(400);
    });

    it('returns 400 with invalid role', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ email: `inv_${Date.now()}@test.com`, role: 'superuser' });

      expect(res.status).toBe(400);
    });

    it('returns 401 without token', async () => {
      const res = await request(app)
        .post(base())
        .send({ email: 'test@test.com' });
      expect(res.status).toBe(401);
    });
  });

  // ── List Invitations ──────────────────────────────────────────────────────
  describe('GET /organizations/:orgId/invitations', () => {
    it('lists invitations', async () => {
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

    it('returns 401 without token', async () => {
      const res = await request(app).get(base());
      expect(res.status).toBe(401);
    });
  });

  // ── Get Invitation by Token ───────────────────────────────────────────────
  describe('GET /organizations/:orgId/invitations/token/:token', () => {
    it('returns 404 for non-existent token', async () => {
      const res = await request(app).get(`${base()}/token/non-existent-token-12345`);
      expect([404, 400]).toContain(res.status);
    });

    it('returns invitation for valid token', async () => {
      if (!createdInvitationId) return;

      // Get the token from DB
      const rows = await AppDataSource.query(
        `SELECT token FROM invitations WHERE id = $1`,
        [createdInvitationId],
      );
      if (!rows.length) return;

      const token = rows[0].token;
      const res = await request(app).get(`${base()}/token/${token}`);
      expect(res.status).toBe(200);
    });
  });

  // ── Accept Invitation ─────────────────────────────────────────────────────
  describe('POST /organizations/:orgId/invitations/accept', () => {
    it('returns 400 with invalid token', async () => {
      const user = await registerAndLogin(app, '_inv_accept');
      const res = await request(app)
        .post(`${base()}/accept`)
        .set(authHeader(user.accessToken))
        .send({ token: 'invalid-token-xyz' });

      expect([400, 404]).toContain(res.status);
    });

    it('returns 400 when token is missing', async () => {
      const user = await registerAndLogin(app, '_inv_accept2');
      const res = await request(app)
        .post(`${base()}/accept`)
        .set(authHeader(user.accessToken))
        .send({});

      expect(res.status).toBe(400);
    });

    it('returns 401 without token', async () => {
      const res = await request(app)
        .post(`${base()}/accept`)
        .send({ token: 'some-token' });
      expect(res.status).toBe(401);
    });
  });

  // ── Revoke Invitation ─────────────────────────────────────────────────────
  describe('DELETE /organizations/:orgId/invitations/:id', () => {
    it('revokes an invitation', async () => {
      if (!createdInvitationId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .delete(`${base()}/${createdInvitationId}`)
        .set(authHeader(admin.accessToken));

      expect([200, 204]).toContain(res.status);
    });

    it('returns 404 for non-existent invitation', async () => {
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
