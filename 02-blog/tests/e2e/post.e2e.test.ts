/**
 * E2E tests for Post endpoints.
 * GET    /api/v1/posts
 * GET    /api/v1/posts/:id
 * GET    /api/v1/posts/slug/:slug
 * POST   /api/v1/posts
 * PUT    /api/v1/posts/:id
 * PUT    /api/v1/posts/:id/publish
 * PUT    /api/v1/posts/:id/unpublish
 * DELETE /api/v1/posts/:id
 * GET    /api/v1/posts/:id/revisions
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
let categoryId: string;
let tagId: string;
let createdPostId: string;
let createdPostSlug: string;

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  app = createApp();
  const tokens = await loginAsAdmin(app);
  adminToken = tokens.accessToken;

  // Create an author
  const authorRes = await supertest(app)
    .post(`${API}/authors`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Post Author', slug: `post-author-${Date.now()}` });
  authorId = authorRes.body.data.id;

  // Get a category
  const catRes = await supertest(app).get(`${API}/categories?limit=1`);
  categoryId = catRes.body.data[0]?.id;

  // Get a tag
  const tagRes = await supertest(app).get(`${API}/tags?limit=1`);
  tagId = tagRes.body.data[0]?.id;
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    
  }
});

describe('GET /posts', () => {
  it('should list posts publicly', async () => {
    const res = await supertest(app).get(`${API}/posts`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should support pagination', async () => {
    const res = await supertest(app).get(`${API}/posts?page=1&limit=5`);
    expect(res.status).toBe(200);
    expect(res.body.meta.limit).toBe(5);
  });

  it('should filter by status', async () => {
    const res = await supertest(app).get(`${API}/posts?status=published`);
    expect(res.status).toBe(200);
  });

  it('should filter by categoryId', async () => {
    if (!categoryId) return;
    const res = await supertest(app).get(`${API}/posts?categoryId=${categoryId}`);
    expect(res.status).toBe(200);
  });
});

describe('POST /posts', () => {
  it('should create a draft post with valid data', async () => {
    const slug = `test-post-${Date.now()}`;
    const res = await supertest(app)
      .post(`${API}/posts`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        authorId,
        title: 'Test Post Title',
        slug,
        content: 'This is the content of the test post.',
        excerpt: 'Short excerpt',
        status: 'draft',
        allowComments: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Test Post Title');
    expect(res.body.data.status).toBe('draft');

    createdPostId = res.body.data.id;
    createdPostSlug = res.body.data.slug;
  });

  it('should create a post with categoryId, tagIds', async () => {
    const tagIds = tagId ? [tagId] : [];
    const res = await supertest(app)
      .post(`${API}/posts`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        authorId,
        categoryId: categoryId || undefined,
        title: 'Post With Category And Tags',
        slug: `post-cat-tag-${Date.now()}`,
        content: 'Content with category and tags.',
        status: 'draft',
        tagIds,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Post With Category And Tags');
  });

  it('should return 400 when authorId is missing', async () => {
    const res = await supertest(app)
      .post(`${API}/posts`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'No Author' });
    expect(res.status).toBe(400);
  });

  it('should return 400 when title is missing', async () => {
    const res = await supertest(app)
      .post(`${API}/posts`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ authorId });
    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid status', async () => {
    const res = await supertest(app)
      .post(`${API}/posts`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ authorId, title: 'Bad Status', status: 'invalid_status' });
    expect(res.status).toBe(400);
  });

  it('should return 401 without authentication', async () => {
    const res = await supertest(app)
      .post(`${API}/posts`)
      .send({ authorId, title: 'Unauthorized Post' });
    expect(res.status).toBe(401);
  });
});

describe('GET /posts/:id', () => {
  it('should get post by ID', async () => {
    const res = await supertest(app).get(`${API}/posts/${createdPostId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdPostId);
  });

  it('should return 404 for non-existent post', async () => {
    const res = await supertest(app).get(`${API}/posts/00000000-0000-0000-0000-000000000000`);
    expect(res.status).toBe(404);
  });
});

describe('GET /posts/slug/:slug', () => {
  it('should get post by slug', async () => {
    const res = await supertest(app).get(`${API}/posts/slug/${createdPostSlug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe(createdPostSlug);
  });

  it('should return 404 for non-existent slug', async () => {
    const res = await supertest(app).get(`${API}/posts/slug/slug-does-not-exist-xyz`);
    expect(res.status).toBe(404);
  });
});

describe('PUT /posts/:id', () => {
  it('should update post', async () => {
    const res = await supertest(app)
      .put(`${API}/posts/${createdPostId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ content: 'Updated content.', metaTitle: 'SEO Title' });

    expect(res.status).toBe(200);
    expect(res.body.data.content).toBe('Updated content.');
  });

  it('should return 401 without authentication', async () => {
    const res = await supertest(app)
      .put(`${API}/posts/${createdPostId}`)
      .send({ title: 'Unauthorized' });
    expect(res.status).toBe(401);
  });

  it('should return 404 for non-existent post', async () => {
    const res = await supertest(app)
      .put(`${API}/posts/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Ghost' });
    expect(res.status).toBe(404);
  });
});

describe('PUT /posts/:id/publish', () => {
  it('should publish a draft post', async () => {
    // Create a fresh draft
    const createRes = await supertest(app)
      .post(`${API}/posts`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ authorId, title: 'To Publish', slug: `to-publish-${Date.now()}`, status: 'draft' });
    const postId = createRes.body.data.id;

    const res = await supertest(app)
      .put(`${API}/posts/${postId}/publish`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('published');
  });

  it('should return 401 without authentication', async () => {
    const res = await supertest(app).put(`${API}/posts/${createdPostId}/publish`);
    expect(res.status).toBe(401);
  });
});

describe('PUT /posts/:id/unpublish', () => {
  it('should unpublish a published post', async () => {
    // Create and publish
    const createRes = await supertest(app)
      .post(`${API}/posts`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ authorId, title: 'To Unpublish', slug: `to-unpublish-${Date.now()}`, status: 'draft' });
    const postId = createRes.body.data.id;

    await supertest(app)
      .put(`${API}/posts/${postId}/publish`)
      .set('Authorization', `Bearer ${adminToken}`);

    const res = await supertest(app)
      .put(`${API}/posts/${postId}/unpublish`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).not.toBe('published');
  });
});

describe('GET /posts/:id/revisions', () => {
  it('should get post revisions (authenticated)', async () => {
    const res = await supertest(app)
      .get(`${API}/posts/${createdPostId}/revisions`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should return 401 without authentication', async () => {
    const res = await supertest(app).get(`${API}/posts/${createdPostId}/revisions`);
    expect(res.status).toBe(401);
  });
});

describe('DELETE /posts/:id', () => {
  it('should delete post', async () => {
    const createRes = await supertest(app)
      .post(`${API}/posts`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ authorId, title: 'Delete Post', slug: `del-post-${Date.now()}`, status: 'draft' });
    const postId = createRes.body.data.id;

    const res = await supertest(app)
      .delete(`${API}/posts/${postId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 401 without authentication', async () => {
    const res = await supertest(app).delete(`${API}/posts/${createdPostId}`);
    expect(res.status).toBe(401);
  });

  it('should return 404 for non-existent post', async () => {
    const res = await supertest(app)
      .delete(`${API}/posts/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});
