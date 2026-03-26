import supertest from 'supertest';
import { getApp } from './setup';

const tokenCache: Record<string, { accessToken: string; refreshToken: string }> = {};

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Login as a predefined test user and cache tokens.
 */
export async function loginAs(
  role: 'admin' | 'staff' | 'customer' | 'customer2' | 'provider',
): Promise<TokenPair> {
  if (tokenCache[role]) return tokenCache[role];

  const credentials: Record<string, { email: string; password: string }> = {
    admin: { email: 'admin@test.com', password: 'Admin@123' },
    staff: { email: 'staff@test.com', password: 'Staff@123' },
    customer: { email: 'customer@test.com', password: 'Customer@123' },
    customer2: { email: 'customer2@test.com', password: 'Customer@123' },
    provider: { email: 'provider@test.com', password: 'Provider@123' },
  };

  const { email, password } = credentials[role];
  const res = await supertest(getApp())
    .post('/api/v1/auth/login')
    .send({ email, password });

  if (res.status !== 200) {
    throw new Error(`loginAs(${role}) failed: ${res.status} ${JSON.stringify(res.body)}`);
  }

  const pair: TokenPair = {
    accessToken: res.body.data.accessToken,
    refreshToken: res.body.data.refreshToken,
  };
  tokenCache[role] = pair;
  return pair;
}

/**
 * Returns just the access token for a role.
 */
export async function getToken(
  role: 'admin' | 'staff' | 'customer' | 'customer2' | 'provider',
): Promise<string> {
  const pair = await loginAs(role);
  return pair.accessToken;
}

/**
 * Clear the token cache (call in afterAll if tokens become stale).
 */
export function clearTokenCache(): void {
  Object.keys(tokenCache).forEach((k) => delete tokenCache[k]);
}

/**
 * Build an authenticated supertest request agent.
 */
export function authRequest(token: string) {
  const app = getApp();
  return {
    get: (url: string) => supertest(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string) => supertest(app).post(url).set('Authorization', `Bearer ${token}`),
    put: (url: string) => supertest(app).put(url).set('Authorization', `Bearer ${token}`),
    patch: (url: string) => supertest(app).patch(url).set('Authorization', `Bearer ${token}`),
    delete: (url: string) => supertest(app).delete(url).set('Authorization', `Bearer ${token}`),
  };
}
