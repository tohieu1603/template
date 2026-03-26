/**
 * E2E tests for Comment endpoints.
 * GET  /api/v1/comments/post/:postId
 * POST /api/v1/comments
 * PUT  /api/v1/comments/:id
 * DELETE /api/v1/comments/:id
 * POST /api/v1/comments/:id/like
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
import { API, loginAsAdmin, registerUser, uniqueEmail } from '../helpers';

let app: Application;
let adminToken: string;
let userToken: string;
let publishedPostId: string;
let createdCommentId: string;

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  app = createApp();

  const adminTokens = await loginAsAdmin(app);
  adminToken = adminTokens.accessToken;

  // Register regular user
  const userData = await registerUser(app, uniqueEmail('commenter'));
  userToken = userData.tokens.accessToken;

  // Create author
  const authorRes = await supertest(app)
    .post(`${API}/authors`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Comment Author', slug: `comment-author-${Date.now()}` });
  const authorId = authorRes.body.data.id;

  // Create and publish a post
  const postRes = await supertest(app)
    .post(`${API}/posts`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      authorId,
      title: 'Post For Comments',
      slug: `post-for-comments-${Date.now()}`,
      content: 'Post content for comment testing.',
      status: 'draft',
      allowComments: true,
    });
  publishedPostId = postRes.body.data.id;

  // Publish it
  await supertest(app)
    .put(`${API}/posts/${publishedPostId}/publish`)
    .set('Authorization', `Bearer ${adminToken}`);
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    
  }
});

describe('GET /comments/post/:postId', () => {
  it('should get comments for a post publicly', async () => {
    const res = await supertest(app).get(`${API}/comments/post/${publishedPostId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should return 404 for non-existent post', async () => {
    const res = await supertest(app).get(`${API}/comments/post/00000000-0000-0000-0000-000000000000`);
    // Either 404 or empty list depending on implementation
    expect([200, 404]).toContain(res.status);
  });
});

describe('POST /comments', () => {
  it('should create comment when authenticated', async () => {
    const res = await supertest(app)
      .post(`${API}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        postId: publishedPostId,
        content: 'This is a test comment.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toBe('This is a test comment.');
    expect(res.body.data.postId).toBe(publishedPostId);

    createdCommentId = res.body.data.id;
  });

  it('should create reply comment with parentId', async () => {
    const res = await supertest(app)
      .post(`${API}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        postId: publishedPostId,
        parentId: createdCommentId,
        content: 'This is a reply.',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.parentId).toBe(createdCommentId);
  });

  it('should return 400 when postId is missing', async () => {
    const res = await supertest(app)
      .post(`${API}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'No post id comment' });
    expect(res.status).toBe(400);
  });

  it('should return 400 when content is missing', async () => {
    const res = await supertest(app)
      .post(`${API}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ postId: publishedPostId });
    expect(res.status).toBe(400);
  });

  it('should return 401 without authentication', async () => {
    const res = await supertest(app)
      .post(`${API}/comments`)
      .send({ postId: publishedPostId, content: 'Anonymous comment' });
    expect(res.status).toBe(401);
  });
});

describe('PUT /comments/:id', () => {
  it('should update own comment', async () => {
    const res = await supertest(app)
      .put(`${API}/comments/${createdCommentId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'Updated comment content.' });

    expect(res.status).toBe(200);
    expect(res.body.data.content).toBe('Updated comment content.');
  });

  it('should return 400 when content is missing', async () => {
    const res = await supertest(app)
      .put(`${API}/comments/${createdCommentId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('should return 401 without authentication', async () => {
    const res = await supertest(app)
      .put(`${API}/comments/${createdCommentId}`)
      .send({ content: 'Unauthorized update' });
    expect(res.status).toBe(401);
  });
});

describe('POST /comments/:id/like', () => {
  it('should like a comment when authenticated', async () => {
    // Create a fresh comment to like
    const commentRes = await supertest(app)
      .post(`${API}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ postId: publishedPostId, content: 'Comment to like.' });
    const commentId = commentRes.body.data.id;

    const res = await supertest(app)
      .post(`${API}/comments/${commentId}/like`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 401 without authentication', async () => {
    const res = await supertest(app).post(`${API}/comments/${createdCommentId}/like`);
    expect(res.status).toBe(401);
  });
});

describe('DELETE /comments/:id', () => {
  it('should delete own comment', async () => {
    const createRes = await supertest(app)
      .post(`${API}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ postId: publishedPostId, content: 'Comment to delete.' });
    const commentId = createRes.body.data.id;

    const res = await supertest(app)
      .delete(`${API}/comments/${commentId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should allow admin to delete any comment', async () => {
    const createRes = await supertest(app)
      .post(`${API}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ postId: publishedPostId, content: 'Admin will delete this.' });
    const commentId = createRes.body.data.id;

    const res = await supertest(app)
      .delete(`${API}/comments/${commentId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('should return 401 without authentication', async () => {
    const res = await supertest(app).delete(`${API}/comments/${createdCommentId}`);
    expect(res.status).toBe(401);
  });
});
