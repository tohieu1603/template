/**
 * E2E tests for Series endpoints.
 * GET    /api/v1/series
 * GET    /api/v1/series/:id
 * GET    /api/v1/series/slug/:slug
 * POST   /api/v1/series
 * PUT    /api/v1/series/:id
 * DELETE /api/v1/series/:id
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
let authorId: string;
let createdSeriesId: string;
let createdSeriesSlug: string;

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  app = createApp();
  const tokens = await loginAsAdmin(app);
  adminToken = tokens.accessToken;

  // Get or create an author
  const authorRes = await supertest(app)
    .post(`${API}/authors`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Series Author', slug: `series-author-${Date.now()}` });
  authorId = authorRes.body.data.id;
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    
  }
});

describe('GET /series', () => {
  it('should list series publicly', async () => {
    const res = await supertest(app).get(`${API}/series`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should support pagination', async () => {
    const res = await supertest(app).get(`${API}/series?page=1&limit=5`);
    expect(res.status).toBe(200);
    expect(res.body.meta.limit).toBe(5);
  });
});

describe('POST /series', () => {
  it('should create series with valid data', async () => {
    const slug = `test-series-${Date.now()}`;
    const res = await supertest(app)
      .post(`${API}/series`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        authorId,
        title: 'Test Series',
        slug,
        description: 'A test series',
        status: 'active',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Test Series');

    createdSeriesId = res.body.data.id;
    createdSeriesSlug = res.body.data.slug;
  });

  it('should return 400 when authorId is missing', async () => {
    const res = await supertest(app)
      .post(`${API}/series`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'No Author Series' });

    expect(res.status).toBe(400);
  });

  it('should return 400 when title is missing', async () => {
    const res = await supertest(app)
      .post(`${API}/series`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ authorId });

    expect(res.status).toBe(400);
  });

  it('should return 401 without authentication', async () => {
    const res = await supertest(app)
      .post(`${API}/series`)
      .send({ authorId, title: 'Unauthorized Series' });
    expect(res.status).toBe(401);
  });
});

describe('GET /series/:id', () => {
  it('should get series by ID', async () => {
    const res = await supertest(app).get(`${API}/series/${createdSeriesId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdSeriesId);
  });

  it('should return 404 for non-existent series', async () => {
    const res = await supertest(app).get(`${API}/series/00000000-0000-0000-0000-000000000000`);
    expect(res.status).toBe(404);
  });
});

describe('GET /series/slug/:slug', () => {
  it('should get series by slug', async () => {
    const res = await supertest(app).get(`${API}/series/slug/${createdSeriesSlug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe(createdSeriesSlug);
  });

  it('should return 404 for non-existent slug', async () => {
    const res = await supertest(app).get(`${API}/series/slug/slug-not-exist-xyz`);
    expect(res.status).toBe(404);
  });
});

describe('PUT /series/:id', () => {
  it('should update series', async () => {
    const res = await supertest(app)
      .put(`${API}/series/${createdSeriesId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Updated series description' });

    expect(res.status).toBe(200);
    expect(res.body.data.description).toBe('Updated series description');
  });

  it('should return 401 without authentication', async () => {
    const res = await supertest(app)
      .put(`${API}/series/${createdSeriesId}`)
      .send({ title: 'Unauthorized' });
    expect(res.status).toBe(401);
  });
});

describe('DELETE /series/:id', () => {
  it('should delete series', async () => {
    const createRes = await supertest(app)
      .post(`${API}/series`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ authorId, title: 'Delete Series', slug: `del-series-${Date.now()}` });
    const seriesId = createRes.body.data.id;

    const res = await supertest(app)
      .delete(`${API}/series/${seriesId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 401 without authentication', async () => {
    const res = await supertest(app).delete(`${API}/series/${createdSeriesId}`);
    expect(res.status).toBe(401);
  });

  it('should return 404 for non-existent series', async () => {
    const res = await supertest(app)
      .delete(`${API}/series/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});
