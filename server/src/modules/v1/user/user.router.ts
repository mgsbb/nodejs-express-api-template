import { Router } from 'express';
import UserController from './user.controller';
import {
    validateInput,
    validateParam,
} from '#src/middlewares/validator.middleware';
import {
    userSchemaRegister,
    userSchemaLogin,
    userIdParamSchema,
    userSchemaUpdate,
    userSchemaUpdatePassword,
} from './user.schema';
import { authenticateUser } from '#src/middlewares/auth.middleware';

const userRouter = Router();

const userController = new UserController();

/**
 *
 * @openapi
 * /api/v1/users:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Users
 *     description: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Timothy
 *               email:
 *                 type: string
 *                 format: email
 *                 example: timothy@email.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Aa1!abcd
 *             required:
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                   example: 12
 *                 name:
 *                   type: string
 *                   example: Timory
 *                 email:
 *                   type: string
 *                   example: timothy@email.com
 *       409:
 *         description: Conflict - email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: email already exists
 *
 */
userRouter.post(
    '/users',
    validateInput(userSchemaRegister),
    userController.handleCreateUser
);
userRouter.post(
    '/users/login',
    validateInput(userSchemaLogin),
    userController.handleLoginUser
);
userRouter.get(
    '/users/:userId',
    validateParam(userIdParamSchema),
    userController.handleGetUser
);
userRouter.patch(
    '/users/:userId',
    validateParam(userIdParamSchema),
    validateInput(userSchemaUpdate),
    authenticateUser,
    userController.handleUpdateUser
);
userRouter.delete(
    '/users/:userId',
    validateParam(userIdParamSchema),
    authenticateUser,
    userController.handleDeleteUser
);
userRouter.patch(
    '/users/:userId/password',
    validateParam(userIdParamSchema),
    validateInput(userSchemaUpdatePassword),
    authenticateUser,
    userController.handleUpdateUserPassword
);
userRouter.get('/users', userController.handleGetUsers);

export default userRouter;
