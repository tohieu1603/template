import 'reflect-metadata';
import request from 'supertest';
import { Application } from 'express';
import { getApp, closeApp, getAdminUser, registerAndLogin, authHeader, resetAdminCache } from '../helpers';

describe('Project E2E', () => {
  let app: Application;
  let orgId: string;
  let createdProjectId: string;

  beforeAll(async () => {
    app = await getApp();
    const admin = await getAdminUser(app);
    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set(authHeader(admin.accessToken))
      .send({ name: `Project Test Org ${Date.now()}` });
    orgId = orgRes.body.data?.id || orgRes.body.data?.organization?.id;
    if (!orgId) throw new Error(`Failed to create test org: ${JSON.stringify(orgRes.body)}`);
  });

  afterAll(async () => {
    resetAdminCache();
    await closeApp();
  });

  const base = () => `/api/v1/organizations/${orgId}/projects`;

  // ── Create Project ────────────────────────────────────────────────────────
  describe('POST /organizations/:orgId/projects', () => {
    it('creates a project with valid data', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({
          name: `Test Project ${Date.now()}`,
          slug: `project-${Date.now()}`,
          description: 'A test project',
          metadata: { key: 'value' },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      createdProjectId = res.body.data?.id || res.body.data?.project?.id;
    });

    it('creates project with minimal required fields', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ name: `Minimal Project ${Date.now()}` });

      expect(res.status).toBe(201);
    });

    it('returns 400 when name is missing', async () => {
      const admin = await getAdminUser(app);
      const res = await request(app)
        .post(base())
        .set(authHeader(admin.accessToken))
        .send({ description: 'No name' });

      expect(res.status).toBe(400);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).post(base()).send({ name: 'Unauth' });
      expect(res.status).toBe(401);
    });
  });

  // ── List Projects ─────────────────────────────────────────────────────────
  describe('GET /organizations/:orgId/projects', () => {
    it('lists projects in the org', async () => {
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
        .get(`${base()}?status=active`)
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

  // ── Get Project ───────────────────────────────────────────────────────────
  describe('GET /organizations/:orgId/projects/:id', () => {
    it('returns project by id', async () => {
      if (!createdProjectId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .get(`${base()}/${createdProjectId}`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('id', createdProjectId);
    });

    it('returns 404 for non-existent project', async () => {
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

  // ── Update Project ────────────────────────────────────────────────────────
  describe('PUT /organizations/:orgId/projects/:id', () => {
    it('updates project fields', async () => {
      if (!createdProjectId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .put(`${base()}/${createdProjectId}`)
        .set(authHeader(admin.accessToken))
        .send({ name: 'Updated Project Name', description: 'Updated description' });

      expect(res.status).toBe(200);
    });

    it('updates project status', async () => {
      if (!createdProjectId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .put(`${base()}/${createdProjectId}`)
        .set(authHeader(admin.accessToken))
        .send({ status: 'archived' });

      expect(res.status).toBe(200);
    });

    it('returns 400 with invalid status', async () => {
      if (!createdProjectId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .put(`${base()}/${createdProjectId}`)
        .set(authHeader(admin.accessToken))
        .send({ status: 'deleted' });

      expect(res.status).toBe(400);
    });

    it('returns 401 without token', async () => {
      const res = await request(app)
        .put(`${base()}/some-id`)
        .send({ name: 'Nope' });
      expect(res.status).toBe(401);
    });
  });

  // ── Delete Project ────────────────────────────────────────────────────────
  describe('DELETE /organizations/:orgId/projects/:id', () => {
    it('deletes a project', async () => {
      if (!createdProjectId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .delete(`${base()}/${createdProjectId}`)
        .set(authHeader(admin.accessToken));

      expect([200, 204]).toContain(res.status);
    });

    it('returns 404 for already deleted project', async () => {
      if (!createdProjectId) return;
      const admin = await getAdminUser(app);
      const res = await request(app)
        .delete(`${base()}/${createdProjectId}`)
        .set(authHeader(admin.accessToken));

      expect(res.status).toBe(404);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).delete(`${base()}/some-id`);
      expect(res.status).toBe(401);
    });
  });
});
