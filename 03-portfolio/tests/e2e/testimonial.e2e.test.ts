/**
 * E2E tests for /api/v1/testimonials
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
  const admin = await createAndLoginUser(app, 'testi_admin', 'super_admin');
  adminToken = admin.accessToken;
});

afterAll(async () => {
  await closeTestDataSource();
});

// ────────────────────────────────────────────────────────────
// POST /api/v1/testimonials
// ────────────────────────────────────────────────────────────

describe('POST /api/v1/testimonials', () => {
  it('201 - creates testimonial with required fields', async () => {
    const res = await request(app)
      .post('/api/v1/testimonials')
      .set(authHeader(adminToken))
      .send({ clientName: 'Alice Smith', content: 'Great work!' });

    expect(res.status).toBe(201);
    expect(res.body.data.clientName).toBe('Alice Smith');
    expect(res.body.data.content).toBe('Great work!');
  });

  it('201 - creates testimonial with all optional fields', async () => {
    const res = await request(app)
      .post('/api/v1/testimonials')
      .set(authHeader(adminToken))
      .send({
        clientName: 'Bob Jones',
        content: 'Excellent service!',
        clientTitle: 'CEO',
        clientCompany: 'TechCorp',
        clientAvatarUrl: 'https://example.com/avatar.jpg',
        rating: 5,
        isFeatured: true,
        isVisible: true,
        sortOrder: 1,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.rating).toBe(5);
    expect(res.body.data.isFeatured).toBe(true);
  });

  it('400 - missing clientName', async () => {
    const res = await request(app)
      .post('/api/v1/testimonials')
      .set(authHeader(adminToken))
      .send({ content: 'Good work!' });
    expect(res.status).toBe(400);
  });

  it('400 - missing content', async () => {
    const res = await request(app)
      .post('/api/v1/testimonials')
      .set(authHeader(adminToken))
      .send({ clientName: 'Charlie' });
    expect(res.status).toBe(400);
  });

  it('400 - rating out of range (>5)', async () => {
    const res = await request(app)
      .post('/api/v1/testimonials')
      .set(authHeader(adminToken))
      .send({ clientName: 'Dave', content: 'OK', rating: 6 });
    expect(res.status).toBe(400);
  });

  it('400 - rating out of range (<1)', async () => {
    const res = await request(app)
      .post('/api/v1/testimonials')
      .set(authHeader(adminToken))
      .send({ clientName: 'Eve', content: 'OK', rating: 0 });
    expect(res.status).toBe(400);
  });

  it('401 - unauthenticated', async () => {
    const res = await request(app)
      .post('/api/v1/testimonials')
      .send({ clientName: 'Anon', content: 'Anon review' });
    expect(res.status).toBe(401);
  });
});

// ────────────────────────────────────────────────────────────
// GET /api/v1/testimonials
// ────────────────────────────────────────────────────────────

describe('GET /api/v1/testimonials', () => {
  it('200 - lists testimonials', async () => {
    const res = await request(app).get('/api/v1/testimonials');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('200 - filters by isVisible', async () => {
    const res = await request(app)
      .get('/api/v1/testimonials')
      .query({ isVisible: 'true' });
    expect(res.status).toBe(200);
  });

  it('200 - filters by isFeatured', async () => {
    const res = await request(app)
      .get('/api/v1/testimonials')
      .query({ isFeatured: 'true' });
    expect(res.status).toBe(200);
  });
});

// ────────────────────────────────────────────────────────────
// GET /api/v1/testimonials/:id
// ────────────────────────────────────────────────────────────

describe('GET /api/v1/testimonials/:id', () => {
  let testimonialId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/testimonials')
      .set(authHeader(adminToken))
      .send({ clientName: 'Get Testimonial', content: 'Read me' });
    testimonialId = res.body.data.id;
  });

  it('200 - returns by id', async () => {
    const res = await request(app)
      .get(`/api/v1/testimonials/${testimonialId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(testimonialId);
  });

  it('404 - not found', async () => {
    const res = await request(app)
      .get('/api/v1/testimonials/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });
});

// ────────────────────────────────────────────────────────────
// PUT /api/v1/testimonials/:id
// ────────────────────────────────────────────────────────────

describe('PUT /api/v1/testimonials/:id', () => {
  let testimonialId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/testimonials')
      .set(authHeader(adminToken))
      .send({ clientName: 'Update Testimonial', content: 'Original content' });
    testimonialId = res.body.data.id;
  });

  it('200 - updates testimonial', async () => {
    const res = await request(app)
      .put(`/api/v1/testimonials/${testimonialId}`)
      .set(authHeader(adminToken))
      .send({ content: 'Updated content', rating: 4 });

    expect(res.status).toBe(200);
    expect(res.body.data.content).toBe('Updated content');
    expect(res.body.data.rating).toBe(4);
  });

  it('401 - unauthenticated', async () => {
    const res = await request(app)
      .put(`/api/v1/testimonials/${testimonialId}`)
      .send({ content: 'Hacked' });
    expect(res.status).toBe(401);
  });
});

// ────────────────────────────────────────────────────────────
// DELETE /api/v1/testimonials/:id
// ────────────────────────────────────────────────────────────

describe('DELETE /api/v1/testimonials/:id', () => {
  let testimonialId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/testimonials')
      .set(authHeader(adminToken))
      .send({ clientName: 'Delete Testimonial', content: 'Delete me' });
    testimonialId = res.body.data.id;
  });

  it('200 - deletes testimonial', async () => {
    const res = await request(app)
      .delete(`/api/v1/testimonials/${testimonialId}`)
      .set(authHeader(adminToken));
    expect(res.status).toBe(200);
  });

  it('404 - already deleted', async () => {
    const res = await request(app)
      .delete(`/api/v1/testimonials/${testimonialId}`)
      .set(authHeader(adminToken));
    expect(res.status).toBe(404);
  });
});
