import express from 'express';
import cookieParser from 'cookie-parser';

import errorHandlerMiddleware from './middlewares/error.middleware';
import { requestLoggerMiddleware } from './middlewares/logger.middleware';
import { requestContextMiddleware } from './middlewares/context.middleware';

import healthRouter from './health/health.router';
import v1Router from './modules/v1';

const app = express();

// to capture data from requests
app.use(express.urlencoded());
app.use(express.json());

// to receive req.cookies
app.use(cookieParser());

app.use(requestContextMiddleware);
app.use(requestLoggerMiddleware);

app.use(v1Router);
app.use(healthRouter);

// error handler at the last
app.use(errorHandlerMiddleware);

export default app;
