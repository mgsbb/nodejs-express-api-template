import { Router } from 'express';
import { sampleGetController } from '../controllers/sampleController';

const sampleRouter = Router();

sampleRouter.get('/sample', sampleGetController);

export default sampleRouter;
