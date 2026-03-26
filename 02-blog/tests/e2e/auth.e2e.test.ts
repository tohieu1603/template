/**
 * E2E tests for Authentication endpoints.
 * POST /api/v1/auth/register
 * POST /api/v1/auth/login
 * POST /api/v1/auth/refresh
 * POST /api/v1/auth/logout
 * GET  /api/v1/auth/me
 */

// Set env BEFORE importing app
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
import { API, uniqueEmail } from '../helpers';

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

describe('POST /auth/register', () => {
  it('should register a new user and return 201', async () => {
    const email = uniqueEmail('reg');
    const res = await supertest(app)
      .post(`${API}/auth/register`)
      .send({ email, password: 'Register@123', fullName: 'New User' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('should return 409 when registering with duplicate email', async () => {
    const email = uniqueEmail('dup');
    await supertest(app)
      .post(`${API}/auth/register`)
      .send({ email, password: 'Dup@12345', fullName: 'First' });

    const res = await supertest(app)
      .post(`${API}/auth/register`)
      .send({ email, password: 'Dup@12345', fullName: 'Second' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for invalid email format', async () => {
    const res = await supertest(app)
      .post(`${API}/auth/register`)
      .send({ email: 'not-an-email', password: 'Pass@1234', fullName: 'Bad Email' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for weak password (no uppercase)', async () => {
    const res = await supertest(app)
      .post(`${API}/auth/register`)
      .send({ email: uniqueEmail(), password: 'weakpassword1', fullName: 'Weak Pass' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for password shorter than 8 chars', async () => {
    const res = await supertest(app)
      .post(`${API}/auth/register`)
      .send({ email: uniqueEmail(), password: 'Sh@1', fullName: 'Short' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when fullName is missing', async () => {
    const res = await supertest(app)
      .post(`${API}/auth/register`)
      .send({ email: uniqueEmail(), password: 'Valid@1234' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /auth/login', () => {
  const loginEmail = uniqueEmail('login');
  const loginPass = 'Login@1234';

  beforeAll(async () => {
    await supertest(app)
      .post(`${API}/auth/register`)
      .send({ email: loginEmail, password: loginPass, fullName: 'Login User' });
  });

  it('should login and return access and refresh tokens', async () => {
    const res = await supertest(app)
      .post(`${API}/auth/login`)
      .send({ email: loginEmail, password: loginPass });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user.email).toBe(loginEmail);
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('should return 401 for wrong password', async () => {
    const res = await supertest(app)
      .post(`${API}/auth/login`)
      .send({ email: loginEmail, password: 'WrongPass@1' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 for non-existent email', async () => {
    const res = await supertest(app)
      .post(`${API}/auth/login`)
      .send({ email: 'nobody@test.com', password: 'Test@1234' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for missing email', async () => {
    const res = await supertest(app)
      .post(`${API}/auth/login`)
      .send({ password: 'Test@1234' });

    expect(res.status).toBe(400);
  });
});

describe('POST /auth/refresh', () => {
  let refreshToken: string;
  let accessToken: string;

  beforeAll(async () => {
    const email = uniqueEmail('refresh');
    await supertest(app)
      .post(`${API}/auth/register`)
      .send({ email, password: 'Refresh@123', fullName: 'Refresh User' });

    const res = await supertest(app)
      .post(`${API}/auth/login`)
      .send({ email, password: 'Refresh@123' });

    refreshToken = res.body.data.refreshToken;
    accessToken = res.body.data.accessToken;
  });

  it('should return new token pair with valid refresh token', async () => {
    const res = await supertest(app)
      .post(`${API}/auth/refresh`)
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('should return 401 when reusing an already-used refresh token', async () => {
    const email = uniqueEmail('reuse');
    await supertest(app)
      .post(`${API}/auth/register`)
      .send({ email, password: 'Reuse@1234', fullName: 'Reuse User' });
    const loginRes = await supertest(app)
      .post(`${API}/auth/login`)
      .send({ email, password: 'Reuse@1234' });
    const rt = loginRes.body.data.refreshToken;

    // Use token once
    await supertest(app).post(`${API}/auth/refresh`).send({ refreshToken: rt });

    // Reuse - should fail
    const res = await supertest(app).post(`${API}/auth/refresh`).send({ refreshToken: rt });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for missing refreshToken', async () => {
    const res = await supertest(app).post(`${API}/auth/refresh`).send({});
    expect(res.status).toBe(400);
  });

  it('should return 401 for invalid refresh token', async () => {
    const res = await supertest(app)
      .post(`${API}/auth/refresh`)
      .send({ refreshToken: 'invalid.token.here' });
    expect(res.status).toBe(401);
  });
});

describe('POST /auth/logout', () => {
  it('should logout successfully', async () => {
    const email = uniqueEmail('logout');
    await supertest(app)
      .post(`${API}/auth/register`)
      .send({ email, password: 'Logout@123', fullName: 'Logout User' });
    const loginRes = await supertest(app)
      .post(`${API}/auth/login`)
      .send({ email, password: 'Logout@123' });
    const rt = loginRes.body.data.refreshToken;

    const res = await supertest(app).post(`${API}/auth/logout`).send({ refreshToken: rt });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 for missing refreshToken', async () => {
    const res = await supertest(app).post(`${API}/auth/logout`).send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /auth/me', () => {
  it('should return current user info with valid token', async () => {
    const email = uniqueEmail('me');
    await supertest(app)
      .post(`${API}/auth/register`)
      .send({ email, password: 'Me@12345x', fullName: 'Me User' });
    const loginRes = await supertest(app)
      .post(`${API}/auth/login`)
      .send({ email, password: 'Me@12345x' });
    const accessToken = loginRes.body.data.accessToken;

    const res = await supertest(app)
      .get(`${API}/auth/me`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(email);
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it('should return 401 without token', async () => {
    const res = await supertest(app).get(`${API}/auth/me`);
    expect(res.status).toBe(401);
  });

  it('should return 401 with invalid token', async () => {
    const res = await supertest(app)
      .get(`${API}/auth/me`)
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
  });
});
