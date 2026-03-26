/**
 * E2E tests for common/shared endpoints.
 * GET /health
 * 404 handling
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

let app: Application;

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  app = createApp();
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    
  }
});

describe('Health Check', () => {
  it('GET /health should return 200 with status info', async () => {
    const res = await supertest(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('API is running');
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.environment).toBe('test');
  });
});

describe('404 Route Handling', () => {
  it('should return 404 for unknown route', async () => {
    const res = await supertest(app).get('/api/v1/unknown-route-xyz');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Route not found');
  });

  it('should return 404 for completely wrong path', async () => {
    const res = await supertest(app).get('/this/does/not/exist');
    expect(res.status).toBe(404);
  });
});

describe('Response format', () => {
  it('successful responses have success:true and data field', async () => {
    const res = await supertest(app).get('/api/v1/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('error responses have success:false and message field', async () => {
    const res = await supertest(app).get('/api/v1/categories/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBeDefined();
  });

  it('validation error responses include errors array', async () => {
    const res = await supertest(app)
      .post('/api/v1/auth/register')
      .send({ email: 'not-email', password: 'weak', fullName: 'X' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
    expect(Array.isArray(res.body.errors)).toBe(true);
  });
});

describe('Content-Type', () => {
  it('should respond with application/json', async () => {
    const res = await supertest(app).get('/health');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});
