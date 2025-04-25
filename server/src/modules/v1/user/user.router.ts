import { Router } from 'express';
import {
    handleCreateUser,
    handleLoginUser,
    handleGetUser,
    handleUpdateUser,
    handleDeleteUser,
} from './user.controller';
import { validateInput } from '#src/middlewares/validator.middleware';
import { userSchemaRegister } from './user.schema';

const userRouter = Router();

userRouter.post('/users', validateInput(userSchemaRegister), handleCreateUser);
userRouter.post('/users/login', handleLoginUser);
userRouter.get('/users/:userId', handleGetUser);
userRouter.patch('/users/:userId', handleUpdateUser);
userRouter.delete('/users/:userId', handleDeleteUser);

export default userRouter;
