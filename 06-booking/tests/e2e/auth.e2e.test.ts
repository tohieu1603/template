import { initTestDb, destroyTestDb, request } from '../setup';
import { loginAs, clearTokenCache } from '../helpers';

const PREFIX = '/api/v1';

beforeAll(async () => {
  await initTestDb();
});

afterAll(async () => {
  clearTokenCache();
  await destroyTestDb();
});

describe('Auth — POST /auth/register', () => {
  it('registers a new user', async () => {
    const ts = Date.now();
    const res = await request()
      .post(`${PREFIX}/auth/register`)
      .send({ email: `newuser_${ts}@test.com`, password: 'NewUser@123', fullName: 'New User' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data.user).toHaveProperty('email');
  });

  it('rejects duplicate email', async () => {
    const ts = Date.now();
    const email = `dup_${ts}@test.com`;
    await request()
      .post(`${PREFIX}/auth/register`)
      .send({ email, password: 'Dup@12345', fullName: 'Dup' });
    const res = await request()
      .post(`${PREFIX}/auth/register`)
      .send({ email, password: 'Dup@12345', fullName: 'Dup' });
    expect(res.status).toBe(409);
  });

  it('rejects invalid payload (missing required fields)', async () => {
    const res = await request()
      .post(`${PREFIX}/auth/register`)
      .send({ email: 'not-an-email' });
    // ValidationError returns 400
    expect(res.status).toBe(400);
  });
});

describe('Auth — POST /auth/login', () => {
  it('logs in admin and returns token pair', async () => {
    const res = await request()
      .post(`${PREFIX}/auth/login`)
      .send({ email: 'admin@test.com', password: 'Admin@123' });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user.email).toBe('admin@test.com');
  });

  it('rejects wrong password', async () => {
    const res = await request()
      .post(`${PREFIX}/auth/login`)
      .send({ email: 'admin@test.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('rejects unknown email', async () => {
    const res = await request()
      .post(`${PREFIX}/auth/login`)
      .send({ email: 'noone@test.com', password: 'Admin@123' });
    expect(res.status).toBe(401);
  });
});

describe('Auth — POST /auth/refresh', () => {
  it('issues new token pair with valid refresh token', async () => {
    const { refreshToken } = await loginAs('customer');
    const res = await request()
      .post(`${PREFIX}/auth/refresh`)
      .send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('rejects invalid refresh token', async () => {
    const res = await request()
      .post(`${PREFIX}/auth/refresh`)
      .send({ refreshToken: 'invalid.token.here' });
    expect(res.status).toBe(401);
  });
});

describe('Auth — GET /auth/me', () => {
  it('returns current user profile', async () => {
    const { accessToken } = await loginAs('admin');
    const res = await request()
      .get(`${PREFIX}/auth/me`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('admin@test.com');
  });

  it('rejects unauthenticated', async () => {
    const res = await request().get(`${PREFIX}/auth/me`);
    expect(res.status).toBe(401);
  });
});

describe('Auth — POST /auth/logout', () => {
  it('logs out successfully', async () => {
    const loginRes = await request()
      .post(`${PREFIX}/auth/login`)
      .send({ email: 'staff@test.com', password: 'Staff@123' });
    const { accessToken, refreshToken } = loginRes.body.data;

    const res = await request()
      .post(`${PREFIX}/auth/logout`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken });
    expect(res.status).toBe(200);
  });
});
