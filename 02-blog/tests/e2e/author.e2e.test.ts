/**
 * E2E tests for Author endpoints.
 * GET    /api/v1/authors
 * GET    /api/v1/authors/:id
 * GET    /api/v1/authors/slug/:slug
 * POST   /api/v1/authors
 * PUT    /api/v1/authors/:id
 * DELETE /api/v1/authors/:id
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
import { API, loginAsAdmin, uniqueEmail } from '../helpers';

let app: Application;
let adminToken: string;
let createdAuthorId: string;
let createdAuthorSlug: string;

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  app = createApp();
  const tokens = await loginAsAdmin(app);
  adminToken = tokens.accessToken;
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    
  }
});

describe('GET /authors', () => {
  it('should list authors publicly (no auth required)', async () => {
    const res = await supertest(app).get(`${API}/authors`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.page).toBe(1);
  });

  it('should support pagination params', async () => {
    const res = await supertest(app).get(`${API}/authors?page=1&limit=5`);
    expect(res.status).toBe(200);
    expect(res.body.meta.limit).toBe(5);
  });
});

describe('POST /authors', () => {
  it('should create author when authenticated with authors.create permission', async () => {
    const slug = `test-author-${Date.now()}`;
    const res = await supertest(app)
      .post(`${API}/authors`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Author',
        slug,
        email: uniqueEmail('author'),
        bio: 'A test author bio',
        jobTitle: 'Software Engineer',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Test Author');
    expect(res.body.data.slug).toBe(slug);

    createdAuthorId = res.body.data.id;
    createdAuthorSlug = res.body.data.slug;
  });

  it('should return 400 when name is missing', async () => {
    const res = await supertest(app)
      .post(`${API}/authors`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ bio: 'No name author' });

    expect(res.status).toBe(400);
  });

  it('should return 401 without authentication', async () => {
    const res = await supertest(app)
      .post(`${API}/authors`)
      .send({ name: 'Unauthorized Author' });
    expect(res.status).toBe(401);
  });
});

describe('GET /authors/:id', () => {
  it('should get author by ID', async () => {
    const res = await supertest(app).get(`${API}/authors/${createdAuthorId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdAuthorId);
  });

  it('should return 404 for non-existent author', async () => {
    const res = await supertest(app).get(`${API}/authors/00000000-0000-0000-0000-000000000000`);
    expect(res.status).toBe(404);
  });
});

describe('GET /authors/slug/:slug', () => {
  it('should get author by slug', async () => {
    const res = await supertest(app).get(`${API}/authors/slug/${createdAuthorSlug}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe(createdAuthorSlug);
  });

  it('should return 404 for non-existent slug', async () => {
    const res = await supertest(app).get(`${API}/authors/slug/this-slug-does-not-exist`);
    expect(res.status).toBe(404);
  });
});

describe('PUT /authors/:id', () => {
  it('should update author with valid data', async () => {
    const res = await supertest(app)
      .put(`${API}/authors/${createdAuthorId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ bio: 'Updated bio content', jobTitle: 'Lead Developer' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bio).toBe('Updated bio content');
  });

  it('should return 401 without authentication', async () => {
    const res = await supertest(app)
      .put(`${API}/authors/${createdAuthorId}`)
      .send({ bio: 'Unauthorized update' });
    expect(res.status).toBe(401);
  });

  it('should return 404 for non-existent author', async () => {
    const res = await supertest(app)
      .put(`${API}/authors/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ bio: 'Updated' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /authors/:id', () => {
  it('should delete author', async () => {
    // Create a dedicated author to delete
    const slug = `delete-author-${Date.now()}`;
    const createRes = await supertest(app)
      .post(`${API}/authors`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Author To Delete', slug });
    const authorId = createRes.body.data.id;

    const res = await supertest(app)
      .delete(`${API}/authors/${authorId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 401 without authentication', async () => {
    const res = await supertest(app)
      .delete(`${API}/authors/${createdAuthorId}`);
    expect(res.status).toBe(401);
  });

  it('should return 404 for non-existent author', async () => {
    const res = await supertest(app)
      .delete(`${API}/authors/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});
