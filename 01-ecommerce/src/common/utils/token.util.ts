import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { jwtConfig } from '../../config/jwt.config';

export interface AccessTokenPayload {
  sub: string;    // user id
  email: string;
  roles: string[];
}

export interface RefreshTokenPayload {
  sub: string;     // user id
  familyId: string;
}

/**
 * Sign a JWT access token.
 */
export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, jwtConfig.accessSecret, {
    expiresIn: jwtConfig.accessExpiresIn as any,
  });
}

/**
 * Sign a JWT refresh token.
 */
export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn as any,
  });
}

/**
 * Verify and decode an access token.
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, jwtConfig.accessSecret) as AccessTokenPayload;
}

/**
 * Verify and decode a refresh token.
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, jwtConfig.refreshSecret) as RefreshTokenPayload;
}

/**
 * Hash a refresh token for secure storage in DB.
 * We store the hash, not the raw token.
 */
export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Parse token expiry string (e.g. "7d") into a Date.
 */
export function getTokenExpiryDate(expiresIn: string): Date {
  const units: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid expiresIn format: ${expiresIn}`);
  const [, amount, unit] = match;
  return new Date(Date.now() + parseInt(amount, 10) * units[unit]);
}
