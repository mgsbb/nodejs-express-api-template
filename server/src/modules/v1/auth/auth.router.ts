import { Router } from 'express';
import AuthController from './auth.controller';
import { validateInput } from '#src/middlewares/validator.middleware';
import {
    authSchemaLogin,
    authSchemaRegister,
    authSchemaUpdatePassword,
} from './auth.schema';
import { authenticateUser } from '#src/middlewares/auth.middleware';

const authRouter = Router();

const authController = new AuthController();

authRouter.post(
    '/auth/register',
    validateInput(authSchemaRegister),
    authController.handleRegisterUser
);
authRouter.post(
    '/auth/login',
    validateInput(authSchemaLogin),
    authController.handleLoginUser
);
authRouter.patch(
    '/auth/password',
    validateInput(authSchemaUpdatePassword),
    authenticateUser,
    authController.handleUpdateUserPassword
);
authRouter.post('/auth/refresh', authController.handleRefreshTokens);

export default authRouter;
