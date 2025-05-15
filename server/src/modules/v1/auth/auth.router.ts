import { Router } from 'express';
import AuthController from './auth.controller';
import { validateInput } from '#src/middlewares/validator.middleware';
import {
    authSchemaLogin,
    authSchemaRegister,
    authSchemaUpdatePassword,
} from './auth.schema';
import { authenticateUser } from '#src/middlewares/auth.middleware';
import AuthRepository from './auth.repository';
import AuthService from './auth.service';

const authRouter = Router();

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

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
