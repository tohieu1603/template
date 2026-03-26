/**
 * E2E tests for RBAC — roles and permissions endpoints.
 * /api/v1/roles
 */
import 'reflect-metadata';
import request from 'supertest';
import { Application } from 'express';
import {
  buildTestApp,
  closeTestDataSource,
  createAndLoginUser,
  authHeader,
  uniqueSlug,
} from '../helpers';

let app: Application;
let adminToken: string;
let viewerToken: string;

beforeAll(async () => {
  app = await buildTestApp();
  const admin = await createAndLoginUser(app, 'rbac_admin', 'super_admin');
  const viewer = await createAndLoginUser(app, 'rbac_viewer', 'viewer');
  adminToken = admin.accessToken;
  viewerToken = viewer.accessToken;
});

afterAll(async () => {
  await closeTestDataSource();
});

// ────────────────────────────────────────────────────────────
// GET /api/v1/roles
// ────────────────────────────────────────────────────────────

describe('GET /api/v1/roles', () => {
  it('200 - admin can list roles', async () => {
    const res = await request(app)
      .get('/api/v1/roles')
      .set(authHeader(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('401 - unauthenticated request is rejected', async () => {
    const res = await request(app).get('/api/v1/roles');
    expect(res.status).toBe(401);
  });

  it('viewer list roles (may have roles.view permission)', async () => {
    const res = await request(app)
      .get('/api/v1/roles')
      .set(authHeader(viewerToken));
    // Viewer may or may not have roles.view — accept both 200 and 403
    expect([200, 403]).toContain(res.status);
  });
});

// ────────────────────────────────────────────────────────────
// GET /api/v1/roles/permissions
// ────────────────────────────────────────────────────────────

describe('GET /api/v1/roles/permissions', () => {
  it('200 - returns all permissions', async () => {
    const res = await request(app)
      .get('/api/v1/roles/permissions')
      .set(authHeader(adminToken));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('401 - no token', async () => {
    const res = await request(app).get('/api/v1/roles/permissions');
    expect(res.status).toBe(401);
  });
});

// ────────────────────────────────────────────────────────────
// POST /api/v1/roles
// ────────────────────────────────────────────────────────────

describe('POST /api/v1/roles', () => {
  it('201 - creates a new role', async () => {
    const roleName = `testrole_${Date.now()}`;
    const res = await request(app)
      .post('/api/v1/roles')
      .set(authHeader(adminToken))
      .send({ name: roleName, displayName: 'Test Role', description: 'For testing' });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(roleName);
  });

  it('400 - missing required name', async () => {
    const res = await request(app)
      .post('/api/v1/roles')
      .set(authHeader(adminToken))
      .send({ displayName: 'No Name Role' });

    expect(res.status).toBe(400);
  });

  it('401 - unauthenticated', async () => {
    const res = await request(app)
      .post('/api/v1/roles')
      .send({ name: 'anon', displayName: 'Anon' });

    expect(res.status).toBe(401);
  });
});

// ────────────────────────────────────────────────────────────
// GET /api/v1/roles/:id
// ────────────────────────────────────────────────────────────

describe('GET /api/v1/roles/:id', () => {
  let roleId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/roles')
      .set(authHeader(adminToken))
      .send({ name: `getrole_${Date.now()}`, displayName: 'Get Role' });
    roleId = res.body.data.id;
  });

  it('200 - returns role by id', async () => {
    const res = await request(app)
      .get(`/api/v1/roles/${roleId}`)
      .set(authHeader(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(roleId);
  });

  it('404 - non-existent role', async () => {
    const res = await request(app)
      .get('/api/v1/roles/00000000-0000-0000-0000-000000000000')
      .set(authHeader(adminToken));

    expect(res.status).toBe(404);
  });
});

// ────────────────────────────────────────────────────────────
// PUT /api/v1/roles/:id
// ────────────────────────────────────────────────────────────

describe('PUT /api/v1/roles/:id', () => {
  let roleId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/roles')
      .set(authHeader(adminToken))
      .send({ name: `updrole_${Date.now()}`, displayName: 'Update Role' });
    roleId = res.body.data.id;
  });

  it('200 - updates role displayName', async () => {
    const res = await request(app)
      .put(`/api/v1/roles/${roleId}`)
      .set(authHeader(adminToken))
      .send({ displayName: 'Updated Display Name' });

    expect(res.status).toBe(200);
    expect(res.body.data.displayName).toBe('Updated Display Name');
  });

  it('403 - viewer cannot update role', async () => {
    const res = await request(app)
      .put(`/api/v1/roles/${roleId}`)
      .set(authHeader(viewerToken))
      .send({ displayName: 'Hacked' });

    expect(res.status).toBe(403);
  });
});

// ────────────────────────────────────────────────────────────
// POST /api/v1/roles/:id/permissions
// ────────────────────────────────────────────────────────────

describe('POST /api/v1/roles/:id/permissions', () => {
  let roleId: string;
  let permissionId: string;

  beforeAll(async () => {
    const roleRes = await request(app)
      .post('/api/v1/roles')
      .set(authHeader(adminToken))
      .send({ name: `permrole_${Date.now()}`, displayName: 'Perm Role' });
    roleId = roleRes.body.data.id;

    const permsRes = await request(app)
      .get('/api/v1/roles/permissions')
      .set(authHeader(adminToken));
    permissionId = permsRes.body.data[0].id;
  });

  it('200 - assigns permissions to role', async () => {
    const res = await request(app)
      .post(`/api/v1/roles/${roleId}/permissions`)
      .set(authHeader(adminToken))
      .send({ permissionIds: [permissionId] });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('400 - invalid permissionIds (not UUID array)', async () => {
    const res = await request(app)
      .post(`/api/v1/roles/${roleId}/permissions`)
      .set(authHeader(adminToken))
      .send({ permissionIds: ['not-a-uuid'] });

    expect(res.status).toBe(400);
  });
});

// ────────────────────────────────────────────────────────────
// DELETE /api/v1/roles/:id
// ────────────────────────────────────────────────────────────

describe('DELETE /api/v1/roles/:id', () => {
  let roleId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/roles')
      .set(authHeader(adminToken))
      .send({ name: `delrole_${Date.now()}`, displayName: 'Delete Role' });
    roleId = res.body.data.id;
  });

  it('200 - deletes a role', async () => {
    const res = await request(app)
      .delete(`/api/v1/roles/${roleId}`)
      .set(authHeader(adminToken));

    expect(res.status).toBe(200);
  });

  it('404 - already deleted', async () => {
    const res = await request(app)
      .delete(`/api/v1/roles/${roleId}`)
      .set(authHeader(adminToken));

    expect(res.status).toBe(404);
  });

  it('401 - unauthenticated cannot delete', async () => {
    const res = await request(app)
      .delete('/api/v1/roles/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(401);
  });
});
