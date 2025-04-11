import { Router } from 'express';
import {
    sampleGetController,
    samplePostController,
} from '../controllers/sampleController';

const sampleRouter = Router();

sampleRouter.get('/sample', sampleGetController);
sampleRouter.post('/sample', samplePostController);

export default sampleRouter;
