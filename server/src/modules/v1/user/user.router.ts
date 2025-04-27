import { Router } from 'express';
import UserController from './user.controller';
import { validateInput } from '#src/middlewares/validator.middleware';
import { userSchemaRegister } from './user.schema';

const userRouter = Router();

const userController = new UserController();

userRouter.post(
    '/users',
    validateInput(userSchemaRegister),
    userController.handleCreateUser
);
userRouter.post('/users/login', userController.handleLoginUser);
userRouter.get('/users/:userId', userController.handleGetUser);
userRouter.patch('/users/:userId', userController.handleUpdateUser);
userRouter.delete('/users/:userId', userController.handleDeleteUser);

export default userRouter;
