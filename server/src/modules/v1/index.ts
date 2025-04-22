import { Router } from 'express';
import sampleRouter from './sample/sample.router';
import userRouter from './user/user.router';

const v1Router = Router();

v1Router.use('/api/v1', sampleRouter);
v1Router.use('/api/v1', userRouter);

export default v1Router;
