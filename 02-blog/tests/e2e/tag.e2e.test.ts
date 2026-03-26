/**
 * E2E tests for Tag endpoints.
 * GET    /api/v1/tags
 * GET    /api/v1/tags/:id
 * GET    /api/v1/tags/slug/:slug
 * POST   /api/v1/tags
 * PUT    /api/v1/tags/:id
 * DELETE /api/v1/tags/:id
 */

process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'blogs';
process.env.DB_HOST = '192.168.1.5';
process.env.DB_PORT = '5432';
process.env.DB_USER = 'duc';
process.env.DB_PASSWORD = '080103';
process.env.DB_SSL = 'false';
process.env.DB_SYNC = 'false';
process.env.DB_LOGGING = 'false';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_key_2026';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_2026';
process.env.RATE_LIMIT_MAX = '10000';

import supertest from 'supertest';
import { Application } from 'express';
import { AppDataSource } from '../../src/config/database.config';
import { createApp } from '../../src/app';
import { API, loginAsAdmin } from '../helpers';

let app: Application;
let adminToken: string;
let createdTagId: string;
let createdTagSlug: string;

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  app = createApp();
  const tokens = await loginAsAdmin(app);
  adminToken = tokens.accessToken;
});

afterAll(async () => {
  // Don't destroy — shared across test suites
});

describe('GET /tags', () => {
  it('should list tags publicly', async () => {
    const res = await supertest(app).get(`${API}/tags`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should support pagination', async () => {
    const res = await supertest(app).get(`${API}/tags?page=1&limit=3`);
    expect(res.status).toBe(200);
    expect(res.body.meta.limit).toBe(3);
  });
});

describe('POST /tags', () => {
  it('should create tag with valid data', async () => {
    const ts = Date.now();
    const slug = `test-tag-${ts}`;
    const res = await supertest(app)
      .post(`${API}/tags`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Test Tag ${ts}`,
        slug,
        description: 'A test tag',
        color: '#ff0000',
        isActive: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toContain('Test Tag');
    expect(res.body.data.color).toBe('#ff0000');

    createdTagId = res.body.data.id;
    createdTagSlug = res.body.data.slug;
  });

  it('should return 400 when name is missing', async () => {
    const res = await supertest(app)
      .post(`${API}/tags`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ slug: 'no-name-tag' });

    expect(res.status).toBe(400);
  });

  it('should return 400 when color exceeds 7 chars', async () => {
    const res = await supertest(app)
      .post(`${API}/tags`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Bad Color Tag', color: '#ff000000' });

    expect(res.status).toBe(400);
  });

  it('should return 401 without authentication', async () => {
    const res = await supertest(app)
      .post(`${API}/tags`)
      .send({ name: 'Unauthorized Tag' });
    expect(res.status).toBe(401);
  });
});

describe('GET /tags/:id', () => {
  it('should get tag by ID', async () => {
    const res = await supertest(app).get(`${API}/tags/${createdTagId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdTagId);
  });

  it('should return 404 for non-existent tag', async () => {
    const res = await supertest(app).get(`${API}/tags/00000000-0000-0000-0000-000000000000`);
    expect(res.status).toBe(404);
  });
});

describe('GET /tags/slug/:slug', () => {
  it('should get tag by slug', async () => {
    const res = await supertest(app).get(`${API}/tags/slug/${createdTagSlug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe(createdTagSlug);
  });

  it('should return 404 for non-existent slug', async () => {
    const res = await supertest(app).get(`${API}/tags/slug/slug-does-not-exist-xyz`);
    expect(res.status).toBe(404);
  });
});

describe('PUT /tags/:id', () => {
  it('should update tag', async () => {
    const res = await supertest(app)
      .put(`${API}/tags/${createdTagId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Updated tag description', color: '#0000ff' });

    expect(res.status).toBe(200);
    expect(res.body.data.description).toBe('Updated tag description');
    expect(res.body.data.color).toBe('#0000ff');
  });

  it('should return 401 without authentication', async () => {
    const res = await supertest(app)
      .put(`${API}/tags/${createdTagId}`)
      .send({ name: 'Unauthorized' });
    expect(res.status).toBe(401);
  });

  it('should return 404 for non-existent tag', async () => {
    const res = await supertest(app)
      .put(`${API}/tags/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Ghost' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /tags/:id', () => {
  it('should delete tag', async () => {
    const createRes = await supertest(app)
      .post(`${API}/tags`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Delete Tag', slug: `del-tag-${Date.now()}` });
    const tagId = createRes.body.data.id;

    const res = await supertest(app)
      .delete(`${API}/tags/${tagId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 401 without authentication', async () => {
    const res = await supertest(app).delete(`${API}/tags/${createdTagId}`);
    expect(res.status).toBe(401);
  });

  it('should return 404 for non-existent tag', async () => {
    const res = await supertest(app)
      .delete(`${API}/tags/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});
