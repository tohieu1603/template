import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../../config/database.config';
import { User } from '../user/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { hashPassword, comparePassword } from '../../common/utils/password.util';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashRefreshToken,
  getTokenExpiryDate,
} from '../../common/utils/token.util';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../../common/errors/app-error';
import { jwtConfig } from '../../config/jwt.config';

/**
 * Authentication service: handles registration, login, token refresh, and logout.
 * Implements JWT family revocation for secure refresh token rotation.
 */
export class AuthService {
  private userRepo = AppDataSource.getRepository(User);
  private tokenRepo = AppDataSource.getRepository(RefreshToken);

  async register(dto: RegisterDto): Promise<{ user: Partial<User> }> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await hashPassword(dto.password);
    const user = this.userRepo.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
    });

    const saved = await this.userRepo.save(user);

    // Assign default viewer role
    await AppDataSource.query(
      `INSERT INTO user_roles (user_id, role_id)
       SELECT $1, id FROM roles WHERE is_default = true LIMIT 1
       ON CONFLICT DO NOTHING`,
      [saved.id],
    );

    return { user: this.sanitizeUser(saved) };
  }

  async login(dto: LoginDto, ip: string, userAgent: string) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const valid = await comparePassword(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    await this.userRepo.update(user.id, { lastLoginAt: new Date() });

    // Get user roles for access token
    const roles = await this.getUserRoles(user.id);

    // Create new token family
    const familyId = uuidv4();
    const tokens = await this.issueTokenPair(user, roles, familyId, ip, userAgent);

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refresh(rawToken: string, ip: string, userAgent: string) {
    let payload: any;
    try {
      payload = verifyRefreshToken(rawToken);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const tokenHash = hashRefreshToken(rawToken);
    const storedToken = await this.tokenRepo.findOne({ where: { tokenHash } });

    if (!storedToken) {
      throw new UnauthorizedError('Refresh token not found');
    }

    // Token reuse detection: revoke entire family
    if (storedToken.isRevoked) {
      await this.revokeFamily(storedToken.familyId);
      throw new UnauthorizedError('Token reuse detected. Please login again');
    }

    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedError('Refresh token expired');
    }

    // Revoke the used token
    await this.tokenRepo.update(storedToken.id, { isRevoked: true });

    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }

    const roles = await this.getUserRoles(user.id);

    // Issue new token pair with same family_id
    const tokens = await this.issueTokenPair(user, roles, storedToken.familyId, ip, userAgent);

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async logout(rawToken: string): Promise<void> {
    const tokenHash = hashRefreshToken(rawToken);
    await this.tokenRepo.update({ tokenHash }, { isRevoked: true });
  }

  async getMe(userId: string): Promise<Partial<User>> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundError('User');
    return this.sanitizeUser(user);
  }

  private async issueTokenPair(user: User, roles: string[], familyId: string, ip: string, userAgent: string) {
    const accessToken = signAccessToken({ sub: user.id, email: user.email, roles });
    const refreshToken = signRefreshToken({ sub: user.id, familyId });

    await this.tokenRepo.save(
      this.tokenRepo.create({
        userId: user.id,
        tokenHash: hashRefreshToken(refreshToken),
        familyId,
        expiresAt: getTokenExpiryDate(jwtConfig.refreshExpiresIn),
        ipAddress: ip,
        userAgent,
      }),
    );

    return { accessToken, refreshToken };
  }

  private async revokeFamily(familyId: string): Promise<void> {
    await this.tokenRepo.update({ familyId }, { isRevoked: true });
  }

  private async getUserRoles(userId: string): Promise<string[]> {
    const result = await AppDataSource.query(
      `SELECT r.name FROM roles r JOIN user_roles ur ON ur.role_id = r.id WHERE ur.user_id = $1`,
      [userId],
    );
    return result.map((r: any) => r.name);
  }

  private sanitizeUser(user: User): Partial<User> {
    const { passwordHash, ...safe } = user as any;
    return safe;
  }
}
