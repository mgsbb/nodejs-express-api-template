import { Router } from 'express';

import {
    handleCreateUser,
    handleLoginUser,
    handleGetUser,
    handleUpdateUser,
    handleDeleteUser,
} from './user.controller';

const userRouter = Router();

userRouter.post('/users', handleCreateUser);
userRouter.post('/users/login', handleLoginUser);
userRouter.get('/users/:userId', handleGetUser);
userRouter.patch('/users/:userId', handleUpdateUser);
userRouter.delete('/users/:userId', handleDeleteUser);

export default userRouter;
