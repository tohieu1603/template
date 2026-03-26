/**
 * E2E tests for /api/v1/experiences
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
  const admin = await createAndLoginUser(app, 'exp_admin', 'super_admin');
  adminToken = admin.accessToken;

  // Create a profile to attach experiences to
  const pRes = await request(app)
    .post('/api/v1/profiles')
    .set(authHeader(adminToken))
    .send({ slug: uniqueSlug('exp_profile'), fullName: 'Experience Profile' });
  profileId = pRes.body.data.id;
});

afterAll(async () => {
  await closeTestDataSource();
});

// ────────────────────────────────────────────────────────────
// POST /api/v1/experiences
// ────────────────────────────────────────────────────────────

describe('POST /api/v1/experiences', () => {
  it('201 - creates work experience', async () => {
    const res = await request(app)
      .post('/api/v1/experiences')
      .set(authHeader(adminToken))
      .send({
        profileId,
        type: 'work',
        title: 'Senior Developer',
        organization: 'Acme Corp',
        startDate: '2020-01-01',
        isCurrent: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Senior Developer');
    expect(res.body.data.type).toBe('work');
  });

  it('201 - creates education experience with end date', async () => {
    const res = await request(app)
      .post('/api/v1/experiences')
      .set(authHeader(adminToken))
      .send({
        profileId,
        type: 'education',
        title: 'B.Sc Computer Science',
        organization: 'MIT',
        startDate: '2015-09-01',
        endDate: '2019-05-31',
        isCurrent: false,
        description: 'Graduated with honors',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.type).toBe('education');
  });

  it('400 - missing required profileId', async () => {
    const res = await request(app)
      .post('/api/v1/experiences')
      .set(authHeader(adminToken))
      .send({ title: 'Dev', organization: 'Co', startDate: '2020-01-01' });

    expect(res.status).toBe(400);
  });

  it('400 - missing required title', async () => {
    const res = await request(app)
      .post('/api/v1/experiences')
      .set(authHeader(adminToken))
      .send({ profileId, organization: 'Co', startDate: '2020-01-01' });

    expect(res.status).toBe(400);
  });

  it('400 - missing required organization', async () => {
    const res = await request(app)
      .post('/api/v1/experiences')
      .set(authHeader(adminToken))
      .send({ profileId, title: 'Dev', startDate: '2020-01-01' });

    expect(res.status).toBe(400);
  });

  it('400 - missing required startDate', async () => {
    const res = await request(app)
      .post('/api/v1/experiences')
      .set(authHeader(adminToken))
      .send({ profileId, title: 'Dev', organization: 'Co' });

    expect(res.status).toBe(400);
  });

  it('400 - invalid type value', async () => {
    const res = await request(app)
      .post('/api/v1/experiences')
      .set(authHeader(adminToken))
      .send({ profileId, title: 'Dev', organization: 'Co', startDate: '2020-01-01', type: 'invalid_type' });

    expect(res.status).toBe(400);
  });

  it('401 - unauthenticated', async () => {
    const res = await request(app)
      .post('/api/v1/experiences')
      .send({ profileId, title: 'Dev', organization: 'Co', startDate: '2020-01-01' });

    expect(res.status).toBe(401);
  });
});

// ────────────────────────────────────────────────────────────
// GET /api/v1/experiences
// ────────────────────────────────────────────────────────────

describe('GET /api/v1/experiences', () => {
  it('200 - lists all experiences', async () => {
    const res = await request(app).get('/api/v1/experiences');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
  });

  it('200 - filters by profileId', async () => {
    const res = await request(app)
      .get('/api/v1/experiences')
      .query({ profileId });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('200 - filters by type', async () => {
    const res = await request(app)
      .get('/api/v1/experiences')
      .query({ type: 'work' });

    expect(res.status).toBe(200);
  });
});

// ────────────────────────────────────────────────────────────
// GET /api/v1/experiences/:id
// ────────────────────────────────────────────────────────────

describe('GET /api/v1/experiences/:id', () => {
  let expId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/experiences')
      .set(authHeader(adminToken))
      .send({ profileId, title: 'Get Exp', organization: 'Org', startDate: '2021-01-01' });
    expId = res.body.data.id;
  });

  it('200 - returns experience by id', async () => {
    const res = await request(app).get(`/api/v1/experiences/${expId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(expId);
  });

  it('404 - non-existent id', async () => {
    const res = await request(app)
      .get('/api/v1/experiences/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });
});

// ────────────────────────────────────────────────────────────
// PUT /api/v1/experiences/:id
// ────────────────────────────────────────────────────────────

describe('PUT /api/v1/experiences/:id', () => {
  let expId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/experiences')
      .set(authHeader(adminToken))
      .send({ profileId, title: 'Update Exp', organization: 'Org', startDate: '2021-01-01' });
    expId = res.body.data.id;
  });

  it('200 - updates experience fields', async () => {
    const res = await request(app)
      .put(`/api/v1/experiences/${expId}`)
      .set(authHeader(adminToken))
      .send({ title: 'Updated Title', location: 'New York' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Title');
    expect(res.body.data.location).toBe('New York');
  });

  it('401 - unauthenticated cannot update', async () => {
    const res = await request(app)
      .put(`/api/v1/experiences/${expId}`)
      .send({ title: 'Hacked' });

    expect(res.status).toBe(401);
  });
});

// ────────────────────────────────────────────────────────────
// DELETE /api/v1/experiences/:id
// ────────────────────────────────────────────────────────────

describe('DELETE /api/v1/experiences/:id', () => {
  let expId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/experiences')
      .set(authHeader(adminToken))
      .send({ profileId, title: 'Delete Exp', organization: 'Org', startDate: '2021-01-01' });
    expId = res.body.data.id;
  });

  it('200 - deletes experience', async () => {
    const res = await request(app)
      .delete(`/api/v1/experiences/${expId}`)
      .set(authHeader(adminToken));

    expect(res.status).toBe(200);
  });

  it('404 - already deleted', async () => {
    const res = await request(app)
      .delete(`/api/v1/experiences/${expId}`)
      .set(authHeader(adminToken));

    expect(res.status).toBe(404);
  });
});
