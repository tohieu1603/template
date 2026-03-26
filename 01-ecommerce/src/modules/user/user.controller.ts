import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { successResponse } from '../../common/dto/api-response.dto';

const userService = new UserService();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management (admin)
 */

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List all users (admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, inactive] }
 *     responses:
 *       200:
 *         description: Paginated user list
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PaginatedResponse' }
 */
export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { users, meta } = await userService.findAll(req.query as any);
    res.json(successResponse(users, undefined, meta));
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID (admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User data
 *       404:
 *         description: User not found
 */
export async function getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.findById(req.params.id);
    res.json(successResponse(user));
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user (admin)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, fullName]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               fullName: { type: string }
 *               phone: { type: string }
 *     responses:
 *       201:
 *         description: User created
 *       409:
 *         description: Email already in use
 */
export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.create(req.body);
    res.status(201).json(successResponse(user, 'User created successfully'));
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update user (admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string }
 *               phone: { type: string }
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: User updated
 */
export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.update(req.params.id, req.body);
    res.json(successResponse(user, 'User updated successfully'));
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user (admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await userService.delete(req.params.id);
    res.json(successResponse(null, 'User deleted successfully'));
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /users/me/password:
 *   put:
 *     tags: [Users]
 *     summary: Update current user's password
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: Password updated
 */
export async function updatePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await userService.updatePassword(req.user!.id, req.body);
    res.json(successResponse(null, 'Password updated successfully'));
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /users/{id}/roles/{roleId}:
 *   post:
 *     tags: [Users]
 *     summary: Assign role to user (admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Role assigned
 */
export async function assignRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await userService.assignRole(req.params.id, req.params.roleId);
    res.json(successResponse(null, 'Role assigned successfully'));
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /users/{id}/roles/{roleId}:
 *   delete:
 *     tags: [Users]
 *     summary: Remove role from user (admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Role removed
 */
export async function removeRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await userService.removeRole(req.params.id, req.params.roleId);
    res.json(successResponse(null, 'Role removed successfully'));
  } catch (error) {
    next(error);
  }
}
