import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { successResponse } from '../../common/dto/api-response.dto';

const userService = new UserService();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List all users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of users }
 */
export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await userService.findAll(req.query as any);
    res.json(successResponse(result.users, undefined, result.meta));
  } catch (error) { next(error); }
}

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: User found }
 *       404: { description: Not found }
 */
export async function getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.findById(req.params.id);
    res.json(successResponse(user));
  } catch (error) { next(error); }
}

/**
 * @swagger
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user
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
 *     responses:
 *       201: { description: User created }
 */
export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.create(req.body);
    res.status(201).json(successResponse(user, 'User created'));
  } catch (error) { next(error); }
}

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: User updated }
 */
export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.update(req.params.id, req.body);
    res.json(successResponse(user, 'User updated'));
  } catch (error) { next(error); }
}

/**
 * @swagger
 * /users/{id}/password:
 *   patch:
 *     tags: [Users]
 *     summary: Change user password
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Password changed }
 */
export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await userService.changePassword(req.params.id, req.body);
    res.json(successResponse(null, 'Password changed'));
  } catch (error) { next(error); }
}

/**
 * @swagger
 * /users/{id}/roles:
 *   post:
 *     tags: [Users]
 *     summary: Assign role to user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Role assigned }
 */
export async function assignRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await userService.assignRole(req.params.id, req.body.roleId);
    res.json(successResponse(null, 'Role assigned'));
  } catch (error) { next(error); }
}

/**
 * @swagger
 * /users/{id}/roles/{roleId}:
 *   delete:
 *     tags: [Users]
 *     summary: Remove role from user
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
 *       200: { description: Role removed }
 */
export async function removeRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await userService.removeRole(req.params.id, req.params.roleId);
    res.json(successResponse(null, 'Role removed'));
  } catch (error) { next(error); }
}

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User deleted }
 */
export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await userService.delete(req.params.id);
    res.json(successResponse(null, 'User deleted'));
  } catch (error) { next(error); }
}
