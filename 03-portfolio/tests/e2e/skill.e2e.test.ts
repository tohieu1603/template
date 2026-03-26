/**
 * E2E tests for /api/v1/skills
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
  const admin = await createAndLoginUser(app, 'skill_admin', 'super_admin');
  adminToken = admin.accessToken;

  const pRes = await request(app)
    .post('/api/v1/profiles')
    .set(authHeader(adminToken))
    .send({ slug: uniqueSlug('skill_profile'), fullName: 'Skill Profile' });
  profileId = pRes.body.data.id;
});

afterAll(async () => {
  await closeTestDataSource();
});

// ────────────────────────────────────────────────────────────
// POST /api/v1/skills
// ────────────────────────────────────────────────────────────

describe('POST /api/v1/skills', () => {
  it('201 - creates skill with required fields', async () => {
    const res = await request(app)
      .post('/api/v1/skills')
      .set(authHeader(adminToken))
      .send({ profileId, name: 'TypeScript' });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('TypeScript');
  });

  it('201 - creates skill with all optional fields', async () => {
    const res = await request(app)
      .post('/api/v1/skills')
      .set(authHeader(adminToken))
      .send({
        profileId,
        name: 'React',
        category: 'frontend',
        level: 90,
        yearsExperience: 5,
        iconUrl: 'https://example.com/react.png',
        sortOrder: 1,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.category).toBe('frontend');
    expect(res.body.data.level).toBe(90);
  });

  it('400 - missing profileId', async () => {
    const res = await request(app)
      .post('/api/v1/skills')
      .set(authHeader(adminToken))
      .send({ name: 'Node.js' });

    expect(res.status).toBe(400);
  });

  it('400 - missing name', async () => {
    const res = await request(app)
      .post('/api/v1/skills')
      .set(authHeader(adminToken))
      .send({ profileId });

    expect(res.status).toBe(400);
  });

  it('400 - level out of range (>100)', async () => {
    const res = await request(app)
      .post('/api/v1/skills')
      .set(authHeader(adminToken))
      .send({ profileId, name: 'Bad Level', level: 150 });

    expect(res.status).toBe(400);
  });

  it('400 - level out of range (<1)', async () => {
    const res = await request(app)
      .post('/api/v1/skills')
      .set(authHeader(adminToken))
      .send({ profileId, name: 'Bad Level', level: 0 });

    expect(res.status).toBe(400);
  });

  it('400 - invalid category', async () => {
    const res = await request(app)
      .post('/api/v1/skills')
      .set(authHeader(adminToken))
      .send({ profileId, name: 'Invalid Cat', category: 'invalid_category' });

    expect(res.status).toBe(400);
  });

  it('401 - unauthenticated', async () => {
    const res = await request(app)
      .post('/api/v1/skills')
      .send({ profileId, name: 'Vue' });

    expect(res.status).toBe(401);
  });
});

// ────────────────────────────────────────────────────────────
// GET /api/v1/skills
// ────────────────────────────────────────────────────────────

describe('GET /api/v1/skills', () => {
  it('200 - lists skills', async () => {
    const res = await request(app).get('/api/v1/skills');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('200 - filters by profileId', async () => {
    const res = await request(app)
      .get('/api/v1/skills')
      .query({ profileId });
    expect(res.status).toBe(200);
  });

  it('200 - filters by category', async () => {
    const res = await request(app)
      .get('/api/v1/skills')
      .query({ category: 'frontend' });
    expect(res.status).toBe(200);
  });
});

// ────────────────────────────────────────────────────────────
// GET /api/v1/skills/:id
// ────────────────────────────────────────────────────────────

describe('GET /api/v1/skills/:id', () => {
  let skillId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/skills')
      .set(authHeader(adminToken))
      .send({ profileId, name: 'Get Skill' });
    skillId = res.body.data.id;
  });

  it('200 - returns skill by id', async () => {
    const res = await request(app).get(`/api/v1/skills/${skillId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(skillId);
  });

  it('404 - not found', async () => {
    const res = await request(app)
      .get('/api/v1/skills/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });
});

// ────────────────────────────────────────────────────────────
// PUT /api/v1/skills/:id
// ────────────────────────────────────────────────────────────

describe('PUT /api/v1/skills/:id', () => {
  let skillId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/skills')
      .set(authHeader(adminToken))
      .send({ profileId, name: 'Update Skill' });
    skillId = res.body.data.id;
  });

  it('200 - updates skill', async () => {
    const res = await request(app)
      .put(`/api/v1/skills/${skillId}`)
      .set(authHeader(adminToken))
      .send({ name: 'Updated Skill', level: 75 });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Skill');
    expect(res.body.data.level).toBe(75);
  });

  it('401 - unauthenticated', async () => {
    const res = await request(app)
      .put(`/api/v1/skills/${skillId}`)
      .send({ name: 'Hacked' });
    expect(res.status).toBe(401);
  });
});

// ────────────────────────────────────────────────────────────
// DELETE /api/v1/skills/:id
// ────────────────────────────────────────────────────────────

describe('DELETE /api/v1/skills/:id', () => {
  let skillId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/skills')
      .set(authHeader(adminToken))
      .send({ profileId, name: 'Delete Skill' });
    skillId = res.body.data.id;
  });

  it('200 - deletes skill', async () => {
    const res = await request(app)
      .delete(`/api/v1/skills/${skillId}`)
      .set(authHeader(adminToken));
    expect(res.status).toBe(200);
  });

  it('404 - already deleted', async () => {
    const res = await request(app)
      .delete(`/api/v1/skills/${skillId}`)
      .set(authHeader(adminToken));
    expect(res.status).toBe(404);
  });
});
