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
