import 'reflect-metadata';
import supertest from 'supertest';
import { getApp, initTestDb, destroyTestDb } from '../setup';
import { clearTokenCache } from '../helpers';

const BASE = '/api/v1/auth';

beforeAll(async () => {
  await initTestDb();
});

afterAll(async () => {
  clearTokenCache();
  await destroyTestDb();
});

describe('Auth E2E', () => {
  // ---- Register ----
  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await supertest(getApp())
        .post(`${BASE}/register`)
        .send({
          email: `newuser_${Date.now()}@test.com`,
          password: 'NewUser@123',
          fullName: 'New User',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toHaveProperty('email');
    });

    it('should fail with missing email', async () => {
      const res = await supertest(getApp())
        .post(`${BASE}/register`)
        .send({ password: 'Test@1234', fullName: 'No Email' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with short password', async () => {
      const res = await supertest(getApp())
        .post(`${BASE}/register`)
        .send({ email: 'short@test.com', password: 'abc', fullName: 'Short Pass' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with password missing uppercase/number', async () => {
      const res = await supertest(getApp())
        .post(`${BASE}/register`)
        .send({ email: 'weak@test.com', password: 'weakpassword', fullName: 'Weak' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 409 on duplicate email', async () => {
      const email = `dup_${Date.now()}@test.com`;
      await supertest(getApp())
        .post(`${BASE}/register`)
        .send({ email, password: 'Dup@12345', fullName: 'First' });

      const res = await supertest(getApp())
        .post(`${BASE}/register`)
        .send({ email, password: 'Dup@12345', fullName: 'Second' });
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- Login ----
  describe('POST /auth/login', () => {
    it('should login successfully and return token pair', async () => {
      const res = await supertest(getApp())
        .post(`${BASE}/login`)
        .send({ email: 'admin@test.com', password: 'Admin@123' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user).toHaveProperty('email', 'admin@test.com');
    });

    it('should return 401 with wrong password', async () => {
      const res = await supertest(getApp())
        .post(`${BASE}/login`)
        .send({ email: 'admin@test.com', password: 'WrongPass@1' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 with nonexistent email', async () => {
      const res = await supertest(getApp())
        .post(`${BASE}/login`)
        .send({ email: 'nobody@noexist.com', password: 'Admin@123' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- GET /me ----
  describe('GET /auth/me', () => {
    let accessToken: string;

    beforeAll(async () => {
      const res = await supertest(getApp())
        .post(`${BASE}/login`)
        .send({ email: 'admin@test.com', password: 'Admin@123' });
      accessToken = res.body.data.accessToken;
    });

    it('should return user profile with valid token', async () => {
      const res = await supertest(getApp())
        .get(`${BASE}/me`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('email', 'admin@test.com');
    });

    it('should return 401 without token', async () => {
      const res = await supertest(getApp()).get(`${BASE}/me`);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      const res = await supertest(getApp())
        .get(`${BASE}/me`)
        .set('Authorization', 'Bearer invalid.token.here');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 with malformed Bearer header', async () => {
      const res = await supertest(getApp())
        .get(`${BASE}/me`)
        .set('Authorization', 'NotBearer token');
      expect(res.status).toBe(401);
    });
  });

  // ---- Refresh Token ----
  describe('POST /auth/refresh', () => {
    let refreshToken: string;

    beforeAll(async () => {
      const res = await supertest(getApp())
        .post(`${BASE}/login`)
        .send({ email: 'customer@test.com', password: 'Customer@123' });
      refreshToken = res.body.data.refreshToken;
    });

    it('should return new token pair on valid refresh token', async () => {
      const res = await supertest(getApp())
        .post(`${BASE}/refresh`)
        .send({ refreshToken });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('should return 401 with invalid refresh token', async () => {
      const res = await supertest(getApp())
        .post(`${BASE}/refresh`)
        .send({ refreshToken: 'invalid-refresh-token' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- Logout ----
  describe('POST /auth/logout', () => {
    it('should logout and revoke refresh token', async () => {
      const loginRes = await supertest(getApp())
        .post(`${BASE}/login`)
        .send({ email: 'customer@test.com', password: 'Customer@123' });
      const { refreshToken } = loginRes.body.data;

      const logoutRes = await supertest(getApp())
        .post(`${BASE}/logout`)
        .send({ refreshToken });
      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.success).toBe(true);

      // Token should now be revoked
      const refreshRes = await supertest(getApp())
        .post(`${BASE}/refresh`)
        .send({ refreshToken });
      expect(refreshRes.status).toBe(401);
    });
  });
});
