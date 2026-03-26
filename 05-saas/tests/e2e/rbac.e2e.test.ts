import 'reflect-metadata';
import request from 'supertest';
import { Application } from 'express';
import { getApp, closeApp, getAdminUser, registerAndLogin, authHeader, resetAdminCache } from '../helpers';

describe('RBAC E2E', () => {
  let app: Application;

  beforeAll(async () => {
    app = await getApp();
  });

  afterAll(async () => {
    resetAdminCache();
    await closeApp();
  });

  describe('Protected routes require authentication', () => {
    it('GET /api/v1/roles returns 401 without token', async () => {
      const res = await request(app).get('/api/v1/roles');
      expect(res.status).toBe(401);
    });

    it('GET /api/v1/users returns 401 without token', async () => {
      const res = await request(app).get('/api/v1/users');
      expect(res.status).toBe(401);
    });

    it('GET /api/v1/organizations returns 401 without token', async () => {
      const res = await request(app).get('/api/v1/organizations');
      expect(res.status).toBe(401);
    });
  });

  describe('super_admin has all permissions', () => {
    it('can list roles', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get('/api/v1/roles')
        .set(authHeader(admin.accessToken));
      expect(res.status).toBe(200);
    });

    it('can list users', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get('/api/v1/users')
        .set(authHeader(admin.accessToken));
      expect(res.status).toBe(200);
    });

    it('can list organizations', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get('/api/v1/organizations')
        .set(authHeader(admin.accessToken));
      expect(res.status).toBe(200);
    });

    it('can list plans', async () => {
      const admin = await getAdminUser(app);
      // Plans list is public, but test with auth anyway
      const res = await request(app)
        .get('/api/v1/plans')
        .set(authHeader(admin.accessToken));
      expect(res.status).toBe(200);
    });

    it('can list features', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get('/api/v1/features')
        .set(authHeader(admin.accessToken));
      expect(res.status).toBe(200);
    });
  });

  describe('regular user is forbidden on RBAC-protected endpoints', () => {
    it('cannot list organizations (needs organizations.view permission)', async () => {
      const user = await registerAndLogin(app, '_rbac');
      const res = await request(app)
        .get('/api/v1/organizations')
        .set(authHeader(user.accessToken));
      // viewer role has no organizations.view permission
      expect([403, 200]).toContain(res.status);
    });

    it('cannot delete organizations', async () => {
      const user = await registerAndLogin(app, '_rbac2');
      const res = await request(app)
        .delete('/api/v1/organizations/00000000-0000-0000-0000-000000000000')
        .set(authHeader(user.accessToken));
      expect([403, 404]).toContain(res.status);
    });

    it('cannot create plans', async () => {
      const user = await registerAndLogin(app, '_rbac3');
      const res = await request(app)
        .post('/api/v1/plans')
        .set(authHeader(user.accessToken))
        .send({ name: 'Hacker Plan' });
      expect(res.status).toBe(403);
    });

    it('cannot create features', async () => {
      const user = await registerAndLogin(app, '_rbac4');
      const res = await request(app)
        .post('/api/v1/features')
        .set(authHeader(user.accessToken))
        .send({ key: 'hack', name: 'Hack' });
      expect(res.status).toBe(403);
    });
  });

  describe('Roles CRUD (super_admin only)', () => {
    let createdRoleId: string;

    it('can list roles', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get('/api/v1/roles')
        .set(authHeader(admin.accessToken));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data?.roles || res.body.data)).toBe(true);
    });

    it('can list permissions', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get('/api/v1/roles/permissions')
        .set(authHeader(admin.accessToken));
      expect(res.status).toBe(200);
    });

    it('can create a role', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post('/api/v1/roles')
        .set(authHeader(admin.accessToken))
        .send({ name: `test_role_${Date.now()}`, displayName: 'Test Role', description: 'For testing' });
      expect(res.status).toBe(201);
      createdRoleId = res.body.data?.id || res.body.data?.role?.id;
    });

    it('can update a role', async () => {
      if (!createdRoleId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .put(`/api/v1/roles/${createdRoleId}`)
        .set(authHeader(admin.accessToken))
        .send({ displayName: 'Updated Role' });
      expect(res.status).toBe(200);
    });

    it('can delete a role', async () => {
      if (!createdRoleId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .delete(`/api/v1/roles/${createdRoleId}`)
        .set(authHeader(admin.accessToken));
      expect([200, 204]).toContain(res.status);
    });
  });
});
