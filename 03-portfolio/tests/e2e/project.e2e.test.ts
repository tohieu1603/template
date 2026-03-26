/**
 * E2E tests for /api/v1/projects
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
let categoryId: string;

beforeAll(async () => {
  app = await buildTestApp();
  const admin = await createAndLoginUser(app, 'proj_admin', 'super_admin');
  adminToken = admin.accessToken;

  // Create a project category for use in tests
  const catSlug = uniqueSlug('proj_cat');
  const catRes = await request(app)
    .post('/api/v1/project-categories')
    .set(authHeader(adminToken))
    .send({ name: 'Test Category', slug: catSlug });
  categoryId = catRes.body.data?.id;
});

afterAll(async () => {
  await closeTestDataSource();
});

// ────────────────────────────────────────────────────────────
// POST /api/v1/projects
// ────────────────────────────────────────────────────────────

describe('POST /api/v1/projects', () => {
  it('201 - creates project with required fields', async () => {
    const slug = uniqueSlug('project');
    const res = await request(app)
      .post('/api/v1/projects')
      .set(authHeader(adminToken))
      .send({ title: 'My Project', slug });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('My Project');
    expect(res.body.data.slug).toBe(slug);
  });

  it('201 - creates project with full details', async () => {
    const slug = uniqueSlug('proj_full');
    const res = await request(app)
      .post('/api/v1/projects')
      .set(authHeader(adminToken))
      .send({
        title: 'Full Project',
        slug,
        categoryId,
        subtitle: 'A subtitle',
        description: 'Full description',
        shortDescription: 'Short',
        clientName: 'Acme',
        projectUrl: 'https://example.com',
        sourceUrl: 'https://github.com/test',
        startDate: '2022-01-01',
        endDate: '2022-12-31',
        status: 'completed',
        isFeatured: true,
        isCaseStudy: false,
        sortOrder: 1,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('completed');
    expect(res.body.data.isFeatured).toBe(true);
  });

  it('400 - missing title', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set(authHeader(adminToken))
      .send({ slug: uniqueSlug('notitle') });

    expect(res.status).toBe(400);
  });

  it('400 - missing slug', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set(authHeader(adminToken))
      .send({ title: 'No Slug' });

    expect(res.status).toBe(400);
  });

  it('400 - invalid status value', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set(authHeader(adminToken))
      .send({ title: 'Bad Status', slug: uniqueSlug('bs'), status: 'unknown' });

    expect(res.status).toBe(400);
  });

  it('401 - unauthenticated', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .send({ title: 'Anon', slug: uniqueSlug('anon') });

    expect(res.status).toBe(401);
  });
});

// ────────────────────────────────────────────────────────────
// GET /api/v1/projects
// ────────────────────────────────────────────────────────────

describe('GET /api/v1/projects', () => {
  it('200 - lists projects', async () => {
    const res = await request(app).get('/api/v1/projects');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
  });

  it('200 - filters by categoryId', async () => {
    const res = await request(app)
      .get('/api/v1/projects')
      .query({ categoryId });
    expect(res.status).toBe(200);
  });

  it('200 - filters by status', async () => {
    const res = await request(app)
      .get('/api/v1/projects')
      .query({ status: 'completed' });
    expect(res.status).toBe(200);
  });

  it('200 - filters by isFeatured', async () => {
    const res = await request(app)
      .get('/api/v1/projects')
      .query({ isFeatured: 'true' });
    expect(res.status).toBe(200);
  });
});

// ────────────────────────────────────────────────────────────
// GET /api/v1/projects/:id and /slug/:slug
// ────────────────────────────────────────────────────────────

describe('GET /api/v1/projects/:id and slug', () => {
  let projectId: string;
  let projectSlug: string;

  beforeAll(async () => {
    projectSlug = uniqueSlug('get_proj');
    const res = await request(app)
      .post('/api/v1/projects')
      .set(authHeader(adminToken))
      .send({ title: 'Get Project', slug: projectSlug });
    projectId = res.body.data.id;
  });

  it('200 - returns by id', async () => {
    const res = await request(app).get(`/api/v1/projects/${projectId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(projectId);
  });

  it('200 - returns by slug', async () => {
    const res = await request(app).get(`/api/v1/projects/slug/${projectSlug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe(projectSlug);
  });

  it('404 - not found by id', async () => {
    const res = await request(app)
      .get('/api/v1/projects/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });

  it('404 - not found by slug', async () => {
    const res = await request(app)
      .get('/api/v1/projects/slug/nonexistent-slug-xyz-proj');
    expect(res.status).toBe(404);
  });
});

// ────────────────────────────────────────────────────────────
// PUT /api/v1/projects/:id
// ────────────────────────────────────────────────────────────

describe('PUT /api/v1/projects/:id', () => {
  let projectId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set(authHeader(adminToken))
      .send({ title: 'Update Project', slug: uniqueSlug('upd_proj') });
    projectId = res.body.data.id;
  });

  it('200 - updates project', async () => {
    const res = await request(app)
      .put(`/api/v1/projects/${projectId}`)
      .set(authHeader(adminToken))
      .send({ title: 'Updated Project Title', status: 'in_progress' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Project Title');
    expect(res.body.data.status).toBe('in_progress');
  });
});

// ────────────────────────────────────────────────────────────
// POST /api/v1/projects/:id/images
// ────────────────────────────────────────────────────────────

describe('POST /api/v1/projects/:id/images', () => {
  let projectId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set(authHeader(adminToken))
      .send({ title: 'Image Project', slug: uniqueSlug('img_proj') });
    projectId = res.body.data.id;
  });

  it('201 - adds project image', async () => {
    const res = await request(app)
      .post(`/api/v1/projects/${projectId}/images`)
      .set(authHeader(adminToken))
      .send({
        projectId,
        url: 'https://example.com/image.jpg',
        altText: 'A project image',
        type: 'image',
        isCover: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.url).toBe('https://example.com/image.jpg');
  });

  it('400 - missing required url', async () => {
    const res = await request(app)
      .post(`/api/v1/projects/${projectId}/images`)
      .set(authHeader(adminToken))
      .send({ projectId });

    expect(res.status).toBe(400);
  });
});

// ────────────────────────────────────────────────────────────
// DELETE /api/v1/projects/:id
// ────────────────────────────────────────────────────────────

describe('DELETE /api/v1/projects/:id', () => {
  let projectId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set(authHeader(adminToken))
      .send({ title: 'Delete Project', slug: uniqueSlug('del_proj') });
    projectId = res.body.data.id;
  });

  it('200 - deletes project', async () => {
    const res = await request(app)
      .delete(`/api/v1/projects/${projectId}`)
      .set(authHeader(adminToken));
    expect(res.status).toBe(200);
  });

  it('404 - already deleted', async () => {
    const res = await request(app)
      .delete(`/api/v1/projects/${projectId}`)
      .set(authHeader(adminToken));
    expect(res.status).toBe(404);
  });
});
