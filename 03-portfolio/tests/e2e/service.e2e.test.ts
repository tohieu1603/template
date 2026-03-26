/**
 * E2E tests for /api/v1/services
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

beforeAll(async () => {
  app = await buildTestApp();
  const admin = await createAndLoginUser(app, 'svc_admin', 'super_admin');
  adminToken = admin.accessToken;
});

afterAll(async () => {
  await closeTestDataSource();
});

// ────────────────────────────────────────────────────────────
// POST /api/v1/services
// ────────────────────────────────────────────────────────────

describe('POST /api/v1/services', () => {
  it('201 - creates service with required fields', async () => {
    const slug = uniqueSlug('service');
    const res = await request(app)
      .post('/api/v1/services')
      .set(authHeader(adminToken))
      .send({ title: 'Web Development', slug });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Web Development');
    expect(res.body.data.slug).toBe(slug);
  });

  it('201 - creates service with all optional fields', async () => {
    const slug = uniqueSlug('svc_full');
    const res = await request(app)
      .post('/api/v1/services')
      .set(authHeader(adminToken))
      .send({
        title: 'Full Service',
        slug,
        description: 'Full description',
        shortDescription: 'Short desc',
        icon: 'code-icon',
        priceType: 'hourly',
        priceFrom: 50,
        priceTo: 150,
        currency: 'USD',
        isFeatured: true,
        isActive: true,
        sortOrder: 1,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.priceType).toBe('hourly');
    expect(res.body.data.priceFrom).toBe(50);
  });

  it('400 - missing title', async () => {
    const res = await request(app)
      .post('/api/v1/services')
      .set(authHeader(adminToken))
      .send({ slug: uniqueSlug('notitle') });
    expect(res.status).toBe(400);
  });

  it('400 - missing slug', async () => {
    const res = await request(app)
      .post('/api/v1/services')
      .set(authHeader(adminToken))
      .send({ title: 'No Slug' });
    expect(res.status).toBe(400);
  });

  it('400 - invalid priceType', async () => {
    const res = await request(app)
      .post('/api/v1/services')
      .set(authHeader(adminToken))
      .send({ title: 'Bad Price', slug: uniqueSlug('bp'), priceType: 'invalid' });
    expect(res.status).toBe(400);
  });

  it('401 - unauthenticated', async () => {
    const res = await request(app)
      .post('/api/v1/services')
      .send({ title: 'Anon', slug: uniqueSlug('anon') });
    expect(res.status).toBe(401);
  });
});

// ────────────────────────────────────────────────────────────
// GET /api/v1/services
// ────────────────────────────────────────────────────────────

describe('GET /api/v1/services', () => {
  it('200 - lists services', async () => {
    const res = await request(app).get('/api/v1/services');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('200 - filters by isActive', async () => {
    const res = await request(app)
      .get('/api/v1/services')
      .query({ isActive: 'true' });
    expect(res.status).toBe(200);
  });

  it('200 - filters by isFeatured', async () => {
    const res = await request(app)
      .get('/api/v1/services')
      .query({ isFeatured: 'true' });
    expect(res.status).toBe(200);
  });
});

// ────────────────────────────────────────────────────────────
// GET /api/v1/services/:id
// ────────────────────────────────────────────────────────────

describe('GET /api/v1/services/:id', () => {
  let serviceId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/services')
      .set(authHeader(adminToken))
      .send({ title: 'Get Service', slug: uniqueSlug('get_svc') });
    serviceId = res.body.data.id;
  });

  it('200 - returns service by id', async () => {
    const res = await request(app).get(`/api/v1/services/${serviceId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(serviceId);
  });

  it('404 - not found', async () => {
    const res = await request(app)
      .get('/api/v1/services/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });
});

// ────────────────────────────────────────────────────────────
// PUT /api/v1/services/:id
// ────────────────────────────────────────────────────────────

describe('PUT /api/v1/services/:id', () => {
  let serviceId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/services')
      .set(authHeader(adminToken))
      .send({ title: 'Update Service', slug: uniqueSlug('upd_svc') });
    serviceId = res.body.data.id;
  });

  it('200 - updates service fields', async () => {
    const res = await request(app)
      .put(`/api/v1/services/${serviceId}`)
      .set(authHeader(adminToken))
      .send({ title: 'Updated Service', isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Service');
    expect(res.body.data.isActive).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────
// DELETE /api/v1/services/:id
// ────────────────────────────────────────────────────────────

describe('DELETE /api/v1/services/:id', () => {
  let serviceId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/services')
      .set(authHeader(adminToken))
      .send({ title: 'Delete Service', slug: uniqueSlug('del_svc') });
    serviceId = res.body.data.id;
  });

  it('200 - deletes service', async () => {
    const res = await request(app)
      .delete(`/api/v1/services/${serviceId}`)
      .set(authHeader(adminToken));
    expect(res.status).toBe(200);
  });

  it('404 - already deleted', async () => {
    const res = await request(app)
      .delete(`/api/v1/services/${serviceId}`)
      .set(authHeader(adminToken));
    expect(res.status).toBe(404);
  });
});
