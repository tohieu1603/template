/**
 * Test helpers: shared utilities for E2E tests.
 */
import supertest from 'supertest';
import { Application } from 'express';

export const API = '/api/v1';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Login and return tokens.
 */
export async function loginAs(
  app: Application,
  email: string,
  password: string,
): Promise<AuthTokens> {
  const res = await supertest(app)
    .post(`${API}/auth/login`)
    .send({ email, password });

  if (res.status !== 200) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(res.body)}`);
  }

  return {
    accessToken: res.body.data.accessToken,
    refreshToken: res.body.data.refreshToken,
  };
}

/**
 * Login as test admin (super_admin role).
 */
export async function loginAsAdmin(app: Application): Promise<AuthTokens> {
  return loginAs(app, 'admin@test.com', 'Admin@123');
}

/**
 * Register a new user and return tokens.
 */
export async function registerUser(
  app: Application,
  email: string,
  password: string = 'Test@1234',
  fullName: string = 'Test User',
): Promise<{ userId: string; tokens: AuthTokens }> {
  const registerRes = await supertest(app)
    .post(`${API}/auth/register`)
    .send({ email, password, fullName });

  if (registerRes.status !== 201) {
    throw new Error(`Register failed: ${JSON.stringify(registerRes.body)}`);
  }

  const tokens = await loginAs(app, email, password);
  return { userId: registerRes.body.data.user.id, tokens };
}

/**
 * Auth header helper.
 */
export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

/**
 * Generate a unique test string with prefix.
 */
export function unique(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Generate a unique test email.
 */
export function uniqueEmail(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}@test.com`;
}
