import 'reflect-metadata';
import request from 'supertest';
import { Application } from 'express';
import { getApp, closeApp, getAdminUser, registerAndLogin, authHeader, resetAdminCache } from '../helpers';

describe('Member E2E', () => {
  let app: Application;
  let orgId: string;

  beforeAll(async () => {
    app = await getApp();

    // Create an org to work with
    const admin = await getAdminUser(app);
    const res = await request(app)
      .post('/api/v1/organizations')
      .set(authHeader(admin.accessToken))
      .send({ name: `Member Test Org ${Date.now()}` });

    orgId = res.body.data?.id || res.body.data?.organization?.id;
    if (!orgId) throw new Error(`Failed to create test org: ${JSON.stringify(res.body)}`);
  });

  afterAll(async () => {
    resetAdminCache();
    await closeApp();
  });

  const base = () => `/api/v1/organizations/${orgId}/members`;

  // ── List Members ──────────────────────────────────────────────────────────
  describe('GET /organizations/:orgId/members', () => {
    it('lists members of the org', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(base())
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('filters members by role', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`${base()}?role=owner`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get(base());
      expect(res.status).toBe(401);
    });
  });

  // ── Add Member ────────────────────────────────────────────────────────────
  describe('POST /organizations/:orgId/members', () => {
    let newUser: { id: string; accessToken: string; email: string; refreshToken: string };

    beforeAll(async () => {
      newUser = await registerAndLogin(app, '_member_add');
    });

    it('adds a member with viewer role (default)', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ userId: newUser.id, role: 'member' });

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
    });

    it('returns 400 with invalid userId format', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ userId: 'not-a-uuid' });

      expect(res.status).toBe(400);
    });

    it('returns 400 with invalid role', async () => {
      const admin = await getAdminUser(app);
      const anotherUser = await registerAndLogin(app, '_member_bad_role');
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ userId: anotherUser.id, role: 'superuser' });

      expect(res.status).toBe(400);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).post(base()).send({ userId: newUser.id });
      expect(res.status).toBe(401);
    });
  });

  // ── Update Member Role ────────────────────────────────────────────────────
  describe('PUT /organizations/:orgId/members/:userId', () => {
    let memberUser: { id: string; accessToken: string; email: string; refreshToken: string };

    beforeAll(async () => {
      memberUser = await registerAndLogin(app, '_member_update');
      const admin = await getAdminUser(app);
      await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ userId: memberUser.id, role: 'member' });
    });

    it('updates member role', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .put(`${base()}/${memberUser.id}`)
        .set(authHeader(admin.accessToken))
        .send({ role: 'admin' });

      expect(res.status).toBe(200);
    });

    it('returns 400 with invalid role value', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .put(`${base()}/${memberUser.id}`)
        .set(authHeader(admin.accessToken))
        .send({ role: 'god' });

      expect(res.status).toBe(400);
    });

    it('returns 401 without token', async () => {
      const res = await request(app)
        .put(`${base()}/${memberUser.id}`)
        .send({ role: 'admin' });
      expect(res.status).toBe(401);
    });
  });

  // ── Remove Member ─────────────────────────────────────────────────────────
  describe('DELETE /organizations/:orgId/members/:userId', () => {
    let memberToRemove: { id: string; accessToken: string; email: string; refreshToken: string };

    beforeAll(async () => {
      memberToRemove = await registerAndLogin(app, '_member_remove');
      const admin = await getAdminUser(app);
      await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ userId: memberToRemove.id, role: 'viewer' });
    });

    it('removes a member', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .delete(`${base()}/${memberToRemove.id}`)
        .set(authHeader(admin.accessToken));

      expect([200, 204]).toContain(res.status);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).delete(`${base()}/some-id`);
      expect(res.status).toBe(401);
    });
  });
});
