import { Router } from 'express';
import sampleRouter from './sample/sample.router';

const v1Router = Router();

v1Router.use('/api/v1', sampleRouter);

export default v1Router;
