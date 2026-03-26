/**
 * E2E tests for common/shared endpoints:
 * - GET /health
 * - GET /api/v1/project-categories
 * - GET /api/v1/technologies
 * - GET /api/v1/certifications
 * - 404 handler
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
let profileId: string;

beforeAll(async () => {
  app = await buildTestApp();
  const admin = await createAndLoginUser(app, 'common_admin', 'super_admin');
  adminToken = admin.accessToken;

  const pRes = await request(app)
    .post('/api/v1/profiles')
    .set(authHeader(adminToken))
    .send({ slug: uniqueSlug('common_profile'), fullName: 'Common Profile' });
  profileId = pRes.body.data.id;
});

afterAll(async () => {
  await closeTestDataSource();
});

// ────────────────────────────────────────────────────────────
// Health check
// ────────────────────────────────────────────────────────────

describe('GET /health', () => {
  it('200 - returns healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('API is running');
    expect(res.body.timestamp).toBeDefined();
  });
});

// ────────────────────────────────────────────────────────────
// 404 handler
// ────────────────────────────────────────────────────────────

describe('404 handler', () => {
  it('404 - unknown route returns error', async () => {
    const res = await request(app).get('/api/v1/nonexistent-endpoint');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────
// Project Categories
// ────────────────────────────────────────────────────────────

describe('Project Categories CRUD', () => {
  let catId: string;

  it('201 POST - creates project category', async () => {
    const slug = uniqueSlug('projcat');
    const res = await request(app)
      .post('/api/v1/project-categories')
      .set(authHeader(adminToken))
      .send({ name: 'Web App', slug });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Web App');
    catId = res.body.data.id;
  });

  it('400 POST - missing name', async () => {
    const res = await request(app)
      .post('/api/v1/project-categories')
      .set(authHeader(adminToken))
      .send({ slug: uniqueSlug('noname') });
    expect(res.status).toBe(400);
  });

  it('200 GET - lists categories', async () => {
    const res = await request(app).get('/api/v1/project-categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('200 GET - returns by id', async () => {
    const res = await request(app).get(`/api/v1/project-categories/${catId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(catId);
  });

  it('200 PUT - updates category', async () => {
    const res = await request(app)
      .put(`/api/v1/project-categories/${catId}`)
      .set(authHeader(adminToken))
      .send({ name: 'Updated Category' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Category');
  });

  it('200 DELETE - deletes category', async () => {
    const res = await request(app)
      .delete(`/api/v1/project-categories/${catId}`)
      .set(authHeader(adminToken));
    expect(res.status).toBe(200);
  });
});

// ────────────────────────────────────────────────────────────
// Technologies
// ────────────────────────────────────────────────────────────

describe('Technologies CRUD', () => {
  let techId: string;

  it('201 POST - creates technology', async () => {
    const slug = uniqueSlug('tech');
    const name = `TestTech_${Date.now()}`;
    const res = await request(app)
      .post('/api/v1/technologies')
      .set(authHeader(adminToken))
      .send({ name, slug, color: '#3178C6' });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(name);
    techId = res.body.data.id;
  });

  it('400 POST - missing name', async () => {
    const res = await request(app)
      .post('/api/v1/technologies')
      .set(authHeader(adminToken))
      .send({ slug: uniqueSlug('noname_tech') });
    expect(res.status).toBe(400);
  });

  it('200 GET - lists technologies', async () => {
    const res = await request(app).get('/api/v1/technologies');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('200 GET - returns by id', async () => {
    const res = await request(app).get(`/api/v1/technologies/${techId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(techId);
  });

  it('200 PUT - updates technology', async () => {
    const res = await request(app)
      .put(`/api/v1/technologies/${techId}`)
      .set(authHeader(adminToken))
      .send({ color: '#000000' });
    expect(res.status).toBe(200);
    expect(res.body.data.color).toBe('#000000');
  });

  it('200 DELETE - deletes technology', async () => {
    const res = await request(app)
      .delete(`/api/v1/technologies/${techId}`)
      .set(authHeader(adminToken));
    expect(res.status).toBe(200);
  });
});

// ────────────────────────────────────────────────────────────
// Certifications
// ────────────────────────────────────────────────────────────

describe('Certifications CRUD', () => {
  let certId: string;

  it('201 POST - creates certification', async () => {
    const res = await request(app)
      .post('/api/v1/certifications')
      .set(authHeader(adminToken))
      .send({
        profileId,
        name: 'AWS Solutions Architect',
        issuer: 'Amazon Web Services',
        issueDate: '2024-01-15',
        credentialId: 'AWS-12345',
        credentialUrl: 'https://aws.amazon.com/cert/12345',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('AWS Solutions Architect');
    certId = res.body.data.id;
  });

  it('400 POST - missing profileId', async () => {
    const res = await request(app)
      .post('/api/v1/certifications')
      .set(authHeader(adminToken))
      .send({ name: 'Cert', issuer: 'Issuer' });
    expect(res.status).toBe(400);
  });

  it('400 POST - missing name', async () => {
    const res = await request(app)
      .post('/api/v1/certifications')
      .set(authHeader(adminToken))
      .send({ profileId, issuer: 'Issuer' });
    expect(res.status).toBe(400);
  });

  it('400 POST - missing issuer', async () => {
    const res = await request(app)
      .post('/api/v1/certifications')
      .set(authHeader(adminToken))
      .send({ profileId, name: 'Cert' });
    expect(res.status).toBe(400);
  });

  it('200 GET - lists certifications', async () => {
    const res = await request(app).get('/api/v1/certifications');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('200 GET - filters by profileId', async () => {
    const res = await request(app)
      .get('/api/v1/certifications')
      .query({ profileId });
    expect(res.status).toBe(200);
  });

  it('200 GET - returns by id', async () => {
    const res = await request(app).get(`/api/v1/certifications/${certId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(certId);
  });

  it('200 PUT - updates certification', async () => {
    const res = await request(app)
      .put(`/api/v1/certifications/${certId}`)
      .set(authHeader(adminToken))
      .send({ name: 'Updated Certification' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Certification');
  });

  it('200 DELETE - deletes certification', async () => {
    const res = await request(app)
      .delete(`/api/v1/certifications/${certId}`)
      .set(authHeader(adminToken));
    expect(res.status).toBe(200);
  });
});

// ────────────────────────────────────────────────────────────
// Pagination and search
// ────────────────────────────────────────────────────────────

describe('Pagination query params', () => {
  it('200 - accepts page/limit', async () => {
    const res = await request(app)
      .get('/api/v1/profiles')
      .query({ page: 2, limit: 3 });
    expect(res.status).toBe(200);
    expect(res.body.meta.page).toBe(2);
    expect(res.body.meta.limit).toBe(3);
  });

  it('400 - rejects limit > 100', async () => {
    const res = await request(app)
      .get('/api/v1/profiles')
      .query({ limit: 200 });
    expect(res.status).toBe(400);
  });

  it('200 - accepts search param', async () => {
    const res = await request(app)
      .get('/api/v1/profiles')
      .query({ search: 'John' });
    expect(res.status).toBe(200);
  });

  it('200 - accepts sortBy and sortOrder', async () => {
    const res = await request(app)
      .get('/api/v1/profiles')
      .query({ sortBy: 'createdAt', sortOrder: 'ASC' });
    expect(res.status).toBe(200);
  });
});
