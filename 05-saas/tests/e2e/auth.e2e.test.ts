import 'reflect-metadata';
import request from 'supertest';
import { Application } from 'express';
import { getApp, closeApp, authHeader } from '../helpers';

const BASE = '/api/v1/auth';

describe('Auth E2E', () => {
  let app: Application;
  let validEmail: string;
  const password = 'Test@123456';

  beforeAll(async () => {
    app = await getApp();
    validEmail = `auth_${Date.now()}@test.com`;
  });

  afterAll(async () => {
    await closeApp();
  });

  // ── Register ──────────────────────────────────────────────────────────────
  describe('POST /auth/register', () => {
    it('registers a new user with valid data', async () => {
      const res = await request(app)
        .post(`${BASE}/register`)
        .send({ email: validEmail, password, fullName: 'Auth Tester' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user).toHaveProperty('email', validEmail);
      expect(res.body.data.user).not.toHaveProperty('passwordHash');
    });

    it('returns 409 when email already registered', async () => {
      const res = await request(app)
        .post(`${BASE}/register`)
        .send({ email: validEmail, password, fullName: 'Duplicate' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 when email is missing', async () => {
      const res = await request(app)
        .post(`${BASE}/register`)
        .send({ password, fullName: 'No Email' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when password is too short', async () => {
      const res = await request(app)
        .post(`${BASE}/register`)
        .send({ email: `short_${Date.now()}@test.com`, password: '123', fullName: 'Short' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when fullName is missing', async () => {
      const res = await request(app)
        .post(`${BASE}/register`)
        .send({ email: `nofull_${Date.now()}@test.com`, password });

      expect(res.status).toBe(400);
    });

    it('registers with optional phone field', async () => {
      const email = `phone_${Date.now()}@test.com`;
      const res = await request(app)
        .post(`${BASE}/register`)
        .send({ email, password, fullName: 'Phone User', phone: '+84912345678' });

      expect(res.status).toBe(201);
    });
  });

  // ── Login ─────────────────────────────────────────────────────────────────
  describe('POST /auth/login', () => {
    it('logs in with valid credentials', async () => {
      const res = await request(app)
        .post(`${BASE}/login`)
        .send({ email: validEmail, password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user).toHaveProperty('email', validEmail);
    });

    it('returns 401 with wrong password', async () => {
      const res = await request(app)
        .post(`${BASE}/login`)
        .send({ email: validEmail, password: 'wrong_password' });

      expect(res.status).toBe(401);
    });

    it('returns 401 with non-existent email', async () => {
      const res = await request(app)
        .post(`${BASE}/login`)
        .send({ email: 'nobody@nowhere.com', password });

      expect(res.status).toBe(401);
    });

    it('returns 400 when email is missing', async () => {
      const res = await request(app)
        .post(`${BASE}/login`)
        .send({ password });

      expect(res.status).toBe(400);
    });
  });

  // ── Refresh ───────────────────────────────────────────────────────────────
  describe('POST /auth/refresh', () => {
    let refreshToken: string;

    beforeAll(async () => {
      const res = await request(app)
        .post(`${BASE}/login`)
        .send({ email: validEmail, password });
      refreshToken = res.body.data.refreshToken;
    });

    it('returns new token pair with valid refresh token', async () => {
      const res = await request(app)
        .post(`${BASE}/refresh`)
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('returns 401 with invalid refresh token', async () => {
      const res = await request(app)
        .post(`${BASE}/refresh`)
        .send({ refreshToken: 'invalid.token.here' });

      expect(res.status).toBe(401);
    });

    it('returns 400 when refreshToken is missing', async () => {
      const res = await request(app)
        .post(`${BASE}/refresh`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  // ── Me ────────────────────────────────────────────────────────────────────
  describe('GET /auth/me', () => {
    let accessToken: string;

    beforeAll(async () => {
      const res = await request(app)
        .post(`${BASE}/login`)
        .send({ email: validEmail, password });
      accessToken = res.body.data.accessToken;
    });

    it('returns current user profile', async () => {
      const res = await request(app)
        .get(`${BASE}/me`)
        .set(authHeader(accessToken));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('email', validEmail);
      expect(res.body.data).not.toHaveProperty('passwordHash');
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get(`${BASE}/me`);
      expect(res.status).toBe(401);
    });

    it('returns 401 with malformed token', async () => {
      const res = await request(app)
        .get(`${BASE}/me`)
        .set({ Authorization: 'Bearer bad.token.value' });
      expect(res.status).toBe(401);
    });
  });

  // ── Logout ────────────────────────────────────────────────────────────────
  describe('POST /auth/logout', () => {
    let refreshToken: string;

    beforeAll(async () => {
      const res = await request(app)
        .post(`${BASE}/login`)
        .send({ email: validEmail, password });
      refreshToken = res.body.data.refreshToken;
    });

    it('logs out successfully', async () => {
      const res = await request(app)
        .post(`${BASE}/logout`)
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('revoked token cannot be refreshed', async () => {
      const loginRes = await request(app)
        .post(`${BASE}/login`)
        .send({ email: validEmail, password });
      const rt = loginRes.body.data.refreshToken;

      await request(app).post(`${BASE}/logout`).send({ refreshToken: rt });

      const refreshRes = await request(app)
        .post(`${BASE}/refresh`)
        .send({ refreshToken: rt });
      expect(refreshRes.status).toBe(401);
    });
  });
});
