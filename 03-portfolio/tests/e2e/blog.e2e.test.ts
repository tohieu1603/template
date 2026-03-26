/**
 * E2E tests for /api/v1/blog
 * Covers: categories, tags, posts
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
  const admin = await createAndLoginUser(app, 'blog_admin', 'super_admin');
  adminToken = admin.accessToken;
});

afterAll(async () => {
  await closeTestDataSource();
});

// ════════════════════════════════════════════════════════════
// Blog Categories
// ════════════════════════════════════════════════════════════

describe('POST /api/v1/blog/categories', () => {
  it('201 - creates a blog category', async () => {
    const slug = uniqueSlug('blog_cat');
    const res = await request(app)
      .post('/api/v1/blog/categories')
      .set(authHeader(adminToken))
      .send({ name: 'Tech', slug });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Tech');
    expect(res.body.data.slug).toBe(slug);
  });

  it('201 - creates with optional description and isActive', async () => {
    const res = await request(app)
      .post('/api/v1/blog/categories')
      .set(authHeader(adminToken))
      .send({ name: 'Design', slug: uniqueSlug('blog_cat_design'), description: 'Design topics', isActive: true });

    expect(res.status).toBe(201);
    expect(res.body.data.isActive).toBe(true);
  });

  it('400 - missing name', async () => {
    const res = await request(app)
      .post('/api/v1/blog/categories')
      .set(authHeader(adminToken))
      .send({ slug: uniqueSlug('noname_cat') });
    expect(res.status).toBe(400);
  });

  it('400 - missing slug', async () => {
    const res = await request(app)
      .post('/api/v1/blog/categories')
      .set(authHeader(adminToken))
      .send({ name: 'No Slug' });
    expect(res.status).toBe(400);
  });

  it('401 - unauthenticated', async () => {
    const res = await request(app)
      .post('/api/v1/blog/categories')
      .send({ name: 'Anon', slug: uniqueSlug('anon_cat') });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/blog/categories', () => {
  it('200 - lists categories', async () => {
    const res = await request(app).get('/api/v1/blog/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('GET /api/v1/blog/categories/:id', () => {
  let catId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/blog/categories')
      .set(authHeader(adminToken))
      .send({ name: 'Get Cat', slug: uniqueSlug('get_cat') });
    catId = res.body.data.id;
  });

  it('200 - returns category by id', async () => {
    const res = await request(app).get(`/api/v1/blog/categories/${catId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(catId);
  });

  it('404 - not found', async () => {
    const res = await request(app)
      .get('/api/v1/blog/categories/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/v1/blog/categories/:id', () => {
  let catId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/blog/categories')
      .set(authHeader(adminToken))
      .send({ name: 'Upd Cat', slug: uniqueSlug('upd_cat') });
    catId = res.body.data.id;
  });

  it('200 - updates category', async () => {
    const res = await request(app)
      .put(`/api/v1/blog/categories/${catId}`)
      .set(authHeader(adminToken))
      .send({ name: 'Updated Category' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Category');
  });
});

describe('DELETE /api/v1/blog/categories/:id', () => {
  let catId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/blog/categories')
      .set(authHeader(adminToken))
      .send({ name: 'Del Cat', slug: uniqueSlug('del_cat') });
    catId = res.body.data.id;
  });

  it('200 - deletes category', async () => {
    const res = await request(app)
      .delete(`/api/v1/blog/categories/${catId}`)
      .set(authHeader(adminToken));
    expect(res.status).toBe(200);
  });

  it('404 - already deleted', async () => {
    const res = await request(app)
      .delete(`/api/v1/blog/categories/${catId}`)
      .set(authHeader(adminToken));
    expect(res.status).toBe(404);
  });
});

// ════════════════════════════════════════════════════════════
// Blog Tags
// ════════════════════════════════════════════════════════════

describe('POST /api/v1/blog/tags', () => {
  it('201 - creates a blog tag', async () => {
    const slug = uniqueSlug('blog_tag');
    const res = await request(app)
      .post('/api/v1/blog/tags')
      .set(authHeader(adminToken))
      .send({ name: 'JavaScript', slug });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('JavaScript');
  });

  it('400 - missing name', async () => {
    const res = await request(app)
      .post('/api/v1/blog/tags')
      .set(authHeader(adminToken))
      .send({ slug: uniqueSlug('noname_tag') });
    expect(res.status).toBe(400);
  });

  it('400 - missing slug', async () => {
    const res = await request(app)
      .post('/api/v1/blog/tags')
      .set(authHeader(adminToken))
      .send({ name: 'No Slug' });
    expect(res.status).toBe(400);
  });

  it('401 - unauthenticated', async () => {
    const res = await request(app)
      .post('/api/v1/blog/tags')
      .send({ name: 'Anon Tag', slug: uniqueSlug('anon_tag') });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/blog/tags', () => {
  it('200 - lists tags', async () => {
    const res = await request(app).get('/api/v1/blog/tags');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('GET /api/v1/blog/tags/:id', () => {
  let tagId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/blog/tags')
      .set(authHeader(adminToken))
      .send({ name: 'Get Tag', slug: uniqueSlug('get_tag') });
    tagId = res.body.data.id;
  });

  it('200 - returns by id', async () => {
    const res = await request(app).get(`/api/v1/blog/tags/${tagId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(tagId);
  });

  it('404 - not found', async () => {
    const res = await request(app)
      .get('/api/v1/blog/tags/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/v1/blog/tags/:id', () => {
  let tagId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/blog/tags')
      .set(authHeader(adminToken))
      .send({ name: 'Upd Tag', slug: uniqueSlug('upd_tag') });
    tagId = res.body.data.id;
  });

  it('200 - updates tag', async () => {
    const res = await request(app)
      .put(`/api/v1/blog/tags/${tagId}`)
      .set(authHeader(adminToken))
      .send({ name: 'Updated Tag' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Tag');
  });
});

describe('DELETE /api/v1/blog/tags/:id', () => {
  let tagId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/blog/tags')
      .set(authHeader(adminToken))
      .send({ name: 'Del Tag', slug: uniqueSlug('del_tag') });
    tagId = res.body.data.id;
  });

  it('200 - deletes tag', async () => {
    const res = await request(app)
      .delete(`/api/v1/blog/tags/${tagId}`)
      .set(authHeader(adminToken));
    expect(res.status).toBe(200);
  });
});

// ════════════════════════════════════════════════════════════
// Blog Posts
// ════════════════════════════════════════════════════════════

describe('POST /api/v1/blog/posts', () => {
  it('201 - creates blog post with required fields', async () => {
    const slug = uniqueSlug('blog_post');
    const res = await request(app)
      .post('/api/v1/blog/posts')
      .set(authHeader(adminToken))
      .send({ title: 'My Blog Post', slug });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('My Blog Post');
    expect(res.body.data.slug).toBe(slug);
  });

  it('201 - creates blog post with all optional fields', async () => {
    const slug = uniqueSlug('blog_post_full');
    const res = await request(app)
      .post('/api/v1/blog/posts')
      .set(authHeader(adminToken))
      .send({
        title: 'Full Blog Post',
        slug,
        excerpt: 'Short excerpt',
        content: '<p>Full content here</p>',
        status: 'published',
        publishedAt: '2026-01-01T00:00:00.000Z',
        isFeatured: true,
        metaTitle: 'SEO Title',
        metaDescription: 'SEO description',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('published');
    expect(res.body.data.isFeatured).toBe(true);
  });

  it('400 - missing title', async () => {
    const res = await request(app)
      .post('/api/v1/blog/posts')
      .set(authHeader(adminToken))
      .send({ slug: uniqueSlug('notitle_post') });
    expect(res.status).toBe(400);
  });

  it('400 - missing slug', async () => {
    const res = await request(app)
      .post('/api/v1/blog/posts')
      .set(authHeader(adminToken))
      .send({ title: 'No Slug Post' });
    expect(res.status).toBe(400);
  });

  it('400 - invalid status', async () => {
    const res = await request(app)
      .post('/api/v1/blog/posts')
      .set(authHeader(adminToken))
      .send({ title: 'Bad Status', slug: uniqueSlug('bs_post'), status: 'pending' });
    expect(res.status).toBe(400);
  });

  it('401 - unauthenticated', async () => {
    const res = await request(app)
      .post('/api/v1/blog/posts')
      .send({ title: 'Anon', slug: uniqueSlug('anon_post') });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/blog/posts', () => {
  it('200 - lists posts', async () => {
    const res = await request(app).get('/api/v1/blog/posts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
  });

  it('200 - filters by status', async () => {
    const res = await request(app)
      .get('/api/v1/blog/posts')
      .query({ status: 'published' });
    expect(res.status).toBe(200);
  });

  it('200 - filters by isFeatured', async () => {
    const res = await request(app)
      .get('/api/v1/blog/posts')
      .query({ isFeatured: 'true' });
    expect(res.status).toBe(200);
  });
});

describe('GET /api/v1/blog/posts/:id and /slug/:slug', () => {
  let postId: string;
  let postSlug: string;

  beforeAll(async () => {
    postSlug = uniqueSlug('get_post');
    const res = await request(app)
      .post('/api/v1/blog/posts')
      .set(authHeader(adminToken))
      .send({ title: 'Get Post', slug: postSlug });
    postId = res.body.data.id;
  });

  it('200 - returns by id', async () => {
    const res = await request(app).get(`/api/v1/blog/posts/${postId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(postId);
  });

  it('200 - returns by slug', async () => {
    const res = await request(app).get(`/api/v1/blog/posts/slug/${postSlug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe(postSlug);
  });

  it('404 - not found by id', async () => {
    const res = await request(app)
      .get('/api/v1/blog/posts/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });

  it('404 - not found by slug', async () => {
    const res = await request(app)
      .get('/api/v1/blog/posts/slug/nonexistent-blog-post-slug');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/v1/blog/posts/:id', () => {
  let postId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/blog/posts')
      .set(authHeader(adminToken))
      .send({ title: 'Update Post', slug: uniqueSlug('upd_post') });
    postId = res.body.data.id;
  });

  it('200 - updates post', async () => {
    const res = await request(app)
      .put(`/api/v1/blog/posts/${postId}`)
      .set(authHeader(adminToken))
      .send({ title: 'Updated Post Title', status: 'draft' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Post Title');
  });
});

describe('DELETE /api/v1/blog/posts/:id', () => {
  let postId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/blog/posts')
      .set(authHeader(adminToken))
      .send({ title: 'Delete Post', slug: uniqueSlug('del_post') });
    postId = res.body.data.id;
  });

  it('200 - deletes post', async () => {
    const res = await request(app)
      .delete(`/api/v1/blog/posts/${postId}`)
      .set(authHeader(adminToken));
    expect(res.status).toBe(200);
  });

  it('404 - already deleted', async () => {
    const res = await request(app)
      .delete(`/api/v1/blog/posts/${postId}`)
      .set(authHeader(adminToken));
    expect(res.status).toBe(404);
  });
});
