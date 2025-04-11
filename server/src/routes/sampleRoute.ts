import { Router } from 'express';
import {
    sampleGetController,
    samplePostController,
    samplePatchController,
} from '../controllers/sampleController';

const sampleRouter = Router();

sampleRouter.get('/sample', sampleGetController);
sampleRouter.post('/sample', samplePostController);
sampleRouter.patch('/sample/:sampleId', samplePatchController);

export default sampleRouter;
