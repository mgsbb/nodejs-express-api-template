import { Router } from 'express';
import { healthCheckHandler } from './health.controller';

const healthRouter = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Healthcheck
 *     description: Responds if the app is up and running
 *     responses:
 *       200:
 *         description: App is up and running
 */
healthRouter.get('/health', healthCheckHandler);

export default healthRouter;
