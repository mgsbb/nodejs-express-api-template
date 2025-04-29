import { Router } from 'express';
import sampleRouter from './sample/sample.router';
import userRouter from './user/user.router';
import postRouter from './posts/post.router';
import commentRouter from './comments/comment.router';

const v1Router = Router();

v1Router.use('/api/v1', sampleRouter);
v1Router.use('/api/v1', userRouter);
v1Router.use('/api/v1', postRouter);
v1Router.use('/api/v1', commentRouter);

export default v1Router;
