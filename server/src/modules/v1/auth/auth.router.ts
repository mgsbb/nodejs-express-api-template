import { Router } from 'express';
import AuthController from './auth.controller';
import { validateInput } from '#src/middlewares/validator.middleware';
import { authSchemaLogin, authSchemaRegister } from './auth.schema';

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

export default authRouter;
