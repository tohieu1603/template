/**
 * E2E tests for /api/v1/auth
 */
import 'reflect-metadata';
import request from 'supertest';
import { Application } from 'express';
import { buildTestApp, closeTestDataSource, getTestDataSource, uniqueEmail } from '../helpers';

let app: Application;

beforeAll(async () => {
  app = await buildTestApp();
});

afterAll(async () => {
  await closeTestDataSource();
});

// ────────────────────────────────────────────────────────────
// POST /api/v1/auth/register
// ────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/register', () => {
  it('201 - registers a new user with required fields', async () => {
    const email = uniqueEmail('reg');
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password1!', fullName: 'John Doe' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('201 - registers with optional phone field', async () => {
    const email = uniqueEmail('reg_phone');
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password1!', fullName: 'Jane Doe', phone: '+1234567890' });

    expect(res.status).toBe(201);
    expect(res.body.data.user.phone).toBe('+1234567890');
  });

  it('400 - rejects invalid email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', password: 'Password1!', fullName: 'Bad User' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('400 - rejects password shorter than 8 chars', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: uniqueEmail('short_pw'), password: 'abc', fullName: 'Short' });

    expect(res.status).toBe(400);
  });

  it('400 - rejects missing fullName', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: uniqueEmail('no_name'), password: 'Password1!' });

    expect(res.status).toBe(400);
  });

  it('409 - rejects duplicate email', async () => {
    const email = uniqueEmail('dup');
    await request(app)
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password1!', fullName: 'First' });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password1!', fullName: 'Second' });

    expect(res.status).toBe(409);
  });
});

// ────────────────────────────────────────────────────────────
// POST /api/v1/auth/login
// ────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/login', () => {
  const email = uniqueEmail('login');
  const password = 'LoginPass1!';

  beforeAll(async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ email, password, fullName: 'Login User' });
  });

  it('200 - returns access and refresh tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user.email).toBe(email);
  });

  it('401 - wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'WrongPass1!' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('401 - non-existent user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@nowhere.com', password: 'Password1!' });

    expect(res.status).toBe(401);
  });

  it('400 - missing password field', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email });

    expect(res.status).toBe(400);
  });
});

// ────────────────────────────────────────────────────────────
// POST /api/v1/auth/refresh
// ────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/refresh', () => {
  let refreshToken: string;

  beforeAll(async () => {
    const email = uniqueEmail('refresh');
    await request(app)
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password1!', fullName: 'Refresh User' });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'Password1!' });

    refreshToken = loginRes.body.data.refreshToken;
  });

  it('200 - issues new token pair', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('401 - invalid refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'invalid.token.here' });

    expect(res.status).toBe(401);
  });

  it('400 - missing refreshToken field', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({});

    expect(res.status).toBe(400);
  });
});

// ────────────────────────────────────────────────────────────
// POST /api/v1/auth/logout
// ────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/logout', () => {
  let refreshToken: string;

  beforeAll(async () => {
    const email = uniqueEmail('logout');
    await request(app)
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password1!', fullName: 'Logout User' });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'Password1!' });

    refreshToken = loginRes.body.data.refreshToken;
  });

  it('200 - logs out successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('400 - missing refreshToken', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .send({});

    expect(res.status).toBe(400);
  });
});

// ────────────────────────────────────────────────────────────
// GET /api/v1/auth/me
// ────────────────────────────────────────────────────────────

describe('GET /api/v1/auth/me', () => {
  let accessToken: string;
  let email: string;

  beforeAll(async () => {
    email = uniqueEmail('me');
    await request(app)
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password1!', fullName: 'Me User' });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'Password1!' });

    accessToken = loginRes.body.data.accessToken;
  });

  it('200 - returns authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(email);
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it('401 - no token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('401 - invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid.token');
    expect(res.status).toBe(401);
  });
});
