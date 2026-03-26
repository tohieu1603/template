/**
 * E2E tests for /api/v1/profiles
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
  const admin = await createAndLoginUser(app, 'profile_admin', 'super_admin');
  adminToken = admin.accessToken;
});

afterAll(async () => {
  await closeTestDataSource();
});

// ────────────────────────────────────────────────────────────
// POST /api/v1/profiles
// ────────────────────────────────────────────────────────────

describe('POST /api/v1/profiles', () => {
  it('201 - creates profile with required fields', async () => {
    const slug = uniqueSlug('profile');
    const res = await request(app)
      .post('/api/v1/profiles')
      .set(authHeader(adminToken))
      .send({ slug, fullName: 'John Portfolio' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe(slug);
    expect(res.body.data.fullName).toBe('John Portfolio');
  });

  it('201 - creates profile with all optional fields', async () => {
    const slug = uniqueSlug('profile_full');
    const res = await request(app)
      .post('/api/v1/profiles')
      .set(authHeader(adminToken))
      .send({
        slug,
        fullName: 'Full Profile',
        title: 'Software Engineer',
        tagline: 'Building great things',
        bio: 'A developer bio',
        email: 'profile@test.com',
        phone: '+1234567890',
        location: 'San Francisco, CA',
        isAvailable: true,
        availabilityText: 'Open to freelance',
        socialGithub: 'https://github.com/test',
        socialLinkedin: 'https://linkedin.com/in/test',
        isPrimary: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Software Engineer');
    expect(res.body.data.isAvailable).toBe(true);
  });

  it('400 - missing required slug', async () => {
    const res = await request(app)
      .post('/api/v1/profiles')
      .set(authHeader(adminToken))
      .send({ fullName: 'No Slug' });

    expect(res.status).toBe(400);
  });

  it('400 - missing required fullName', async () => {
    const res = await request(app)
      .post('/api/v1/profiles')
      .set(authHeader(adminToken))
      .send({ slug: uniqueSlug('noname') });

    expect(res.status).toBe(400);
  });

  it('401 - unauthenticated cannot create', async () => {
    const res = await request(app)
      .post('/api/v1/profiles')
      .send({ slug: uniqueSlug('anon'), fullName: 'Anon' });

    expect(res.status).toBe(401);
  });
});

// ────────────────────────────────────────────────────────────
// GET /api/v1/profiles
// ────────────────────────────────────────────────────────────

describe('GET /api/v1/profiles', () => {
  it('200 - returns paginated profiles', async () => {
    const res = await request(app).get('/api/v1/profiles');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.page).toBe(1);
  });

  it('200 - pagination params', async () => {
    const res = await request(app)
      .get('/api/v1/profiles')
      .query({ page: 1, limit: 5 });

    expect(res.status).toBe(200);
    expect(res.body.meta.limit).toBe(5);
  });
});

// ────────────────────────────────────────────────────────────
// GET /api/v1/profiles/:id
// ────────────────────────────────────────────────────────────

describe('GET /api/v1/profiles/:id', () => {
  let profileId: string;
  let profileSlug: string;

  beforeAll(async () => {
    profileSlug = uniqueSlug('get_profile');
    const res = await request(app)
      .post('/api/v1/profiles')
      .set(authHeader(adminToken))
      .send({ slug: profileSlug, fullName: 'Get Profile' });
    profileId = res.body.data.id;
  });

  it('200 - returns profile by id', async () => {
    const res = await request(app).get(`/api/v1/profiles/${profileId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(profileId);
  });

  it('200 - returns profile by slug', async () => {
    const res = await request(app).get(`/api/v1/profiles/slug/${profileSlug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe(profileSlug);
  });

  it('404 - non-existent id', async () => {
    const res = await request(app)
      .get('/api/v1/profiles/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });

  it('404 - non-existent slug', async () => {
    const res = await request(app).get('/api/v1/profiles/slug/nonexistent-slug-xyz');
    expect(res.status).toBe(404);
  });
});

// ────────────────────────────────────────────────────────────
// PUT /api/v1/profiles/:id
// ────────────────────────────────────────────────────────────

describe('PUT /api/v1/profiles/:id', () => {
  let profileId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/profiles')
      .set(authHeader(adminToken))
      .send({ slug: uniqueSlug('upd_profile'), fullName: 'Update Profile' });
    profileId = res.body.data.id;
  });

  it('200 - updates profile fields', async () => {
    const res = await request(app)
      .put(`/api/v1/profiles/${profileId}`)
      .set(authHeader(adminToken))
      .send({ slug: uniqueSlug('updated'), fullName: 'Updated Name', title: 'New Title' });

    expect(res.status).toBe(200);
    expect(res.body.data.fullName).toBe('Updated Name');
    expect(res.body.data.title).toBe('New Title');
  });

  it('401 - unauthenticated cannot update', async () => {
    const res = await request(app)
      .put(`/api/v1/profiles/${profileId}`)
      .send({ slug: uniqueSlug('hack'), fullName: 'Hacked' });

    expect(res.status).toBe(401);
  });
});

// ────────────────────────────────────────────────────────────
// DELETE /api/v1/profiles/:id
// ────────────────────────────────────────────────────────────

describe('DELETE /api/v1/profiles/:id', () => {
  let profileId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/profiles')
      .set(authHeader(adminToken))
      .send({ slug: uniqueSlug('del_profile'), fullName: 'Delete Profile' });
    profileId = res.body.data.id;
  });

  it('200 - deletes profile', async () => {
    const res = await request(app)
      .delete(`/api/v1/profiles/${profileId}`)
      .set(authHeader(adminToken));

    expect(res.status).toBe(200);
  });

  it('404 - already deleted', async () => {
    const res = await request(app)
      .delete(`/api/v1/profiles/${profileId}`)
      .set(authHeader(adminToken));

    expect(res.status).toBe(404);
  });

  it('401 - unauthenticated cannot delete', async () => {
    const res = await request(app)
      .delete('/api/v1/profiles/00000000-0000-0000-0000-000000000000');

    expect(res.status).toBe(401);
  });
});
