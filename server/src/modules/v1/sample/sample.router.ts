import { Router } from 'express';
import {
    sampleGetController,
    samplePostController,
    samplePatchController,
} from './sample.controller';
import { sampleSchemaPost, sampleSchemaPatch } from './sample.schema';
import { validateInput } from '#src/middlewares/validator.middleware';

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
