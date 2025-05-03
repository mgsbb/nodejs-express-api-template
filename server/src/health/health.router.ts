import { Router } from 'express';
import { healthCheckHandler } from './health.controller';

const healthRouter = Router();

healthRouter.get('/health', healthCheckHandler);

export default healthRouter;
