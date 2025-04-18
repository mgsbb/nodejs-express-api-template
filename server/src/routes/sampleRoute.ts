import { Router } from 'express';
import {
    sampleGetController,
    samplePostController,
    samplePatchController,
} from '../controllers/sampleController';
import {
    sampleSchemaPost,
    sampleSchemaPatch,
    validateInput,
} from '../validators/sampleValidators';

const sampleRouter = Router();

sampleRouter.get('/sample', sampleGetController);
sampleRouter.post(
    '/sample',
    validateInput(sampleSchemaPost),
    samplePostController
);
sampleRouter.patch(
    '/sample/:sampleId',
    validateInput(sampleSchemaPatch),
    samplePatchController
);

export default sampleRouter;
