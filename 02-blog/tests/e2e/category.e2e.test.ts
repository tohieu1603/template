/**
 * E2E tests for Category endpoints.
 * GET    /api/v1/categories
 * GET    /api/v1/categories/tree
 * GET    /api/v1/categories/:id
 * GET    /api/v1/categories/slug/:slug
 * POST   /api/v1/categories
 * PUT    /api/v1/categories/:id
 * DELETE /api/v1/categories/:id
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
let createdCategoryId: string;
let createdCategorySlug: string;

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

describe('GET /categories', () => {
  it('should list categories publicly', async () => {
    const res = await supertest(app).get(`${API}/categories`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should support search param', async () => {
    const res = await supertest(app).get(`${API}/categories?search=technology`);
    expect(res.status).toBe(200);
  });

  it('should support pagination', async () => {
    const res = await supertest(app).get(`${API}/categories?page=1&limit=5`);
    expect(res.status).toBe(200);
    expect(res.body.meta.limit).toBe(5);
  });
});

describe('GET /categories/tree', () => {
  it('should return category tree', async () => {
    const res = await supertest(app).get(`${API}/categories/tree`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('POST /categories', () => {
  it('should create category with valid data', async () => {
    const slug = `test-cat-${Date.now()}`;
    const res = await supertest(app)
      .post(`${API}/categories`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Category',
        slug,
        description: 'A test category',
        isActive: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Test Category');
    expect(res.body.data.slug).toBe(slug);

    createdCategoryId = res.body.data.id;
    createdCategorySlug = res.body.data.slug;
  });

  it('should create subcategory with parentId', async () => {
    const res = await supertest(app)
      .post(`${API}/categories`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Sub Category',
        slug: `sub-cat-${Date.now()}`,
        parentId: createdCategoryId,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.parentId).toBe(createdCategoryId);
  });

  it('should return 400 when name is missing', async () => {
    const res = await supertest(app)
      .post(`${API}/categories`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ slug: 'no-name' });

    expect(res.status).toBe(400);
  });

  it('should return 401 without authentication', async () => {
    const res = await supertest(app)
      .post(`${API}/categories`)
      .send({ name: 'Unauthorized Category' });
    expect(res.status).toBe(401);
  });
});

describe('GET /categories/:id', () => {
  it('should get category by ID', async () => {
    const res = await supertest(app).get(`${API}/categories/${createdCategoryId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdCategoryId);
  });

  it('should return 404 for non-existent category', async () => {
    const res = await supertest(app).get(`${API}/categories/00000000-0000-0000-0000-000000000000`);
    expect(res.status).toBe(404);
  });
});

describe('GET /categories/slug/:slug', () => {
  it('should get category by slug', async () => {
    const res = await supertest(app).get(`${API}/categories/slug/${createdCategorySlug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe(createdCategorySlug);
  });

  it('should return 404 for non-existent slug', async () => {
    const res = await supertest(app).get(`${API}/categories/slug/slug-not-exist-xyz`);
    expect(res.status).toBe(404);
  });
});

describe('PUT /categories/:id', () => {
  it('should update category', async () => {
    const res = await supertest(app)
      .put(`${API}/categories/${createdCategoryId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Updated description', seoTitle: 'SEO Title' });

    expect(res.status).toBe(200);
    expect(res.body.data.description).toBe('Updated description');
  });

  it('should return 401 without authentication', async () => {
    const res = await supertest(app)
      .put(`${API}/categories/${createdCategoryId}`)
      .send({ name: 'Unauthorized Update' });
    expect(res.status).toBe(401);
  });
});

describe('DELETE /categories/:id', () => {
  it('should delete category', async () => {
    const createRes = await supertest(app)
      .post(`${API}/categories`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Delete Me', slug: `del-cat-${Date.now()}` });
    const catId = createRes.body.data.id;

    const res = await supertest(app)
      .delete(`${API}/categories/${catId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 401 without authentication', async () => {
    const res = await supertest(app).delete(`${API}/categories/${createdCategoryId}`);
    expect(res.status).toBe(401);
  });

  it('should return 404 for non-existent category', async () => {
    const res = await supertest(app)
      .delete(`${API}/categories/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});
