import express from 'express';
import cookieParser from 'cookie-parser';

import errorHandler from './middlewares/error.middleware';
import { requestAndReponseLogger } from './middlewares/logger.middleware';
import { enableRequestContext } from './middlewares/context.middleware';

import v1Router from './modules/v1';

const app = express();

// to capture data from requests
app.use(express.urlencoded());
app.use(express.json());

// to receive req.cookies
app.use(cookieParser());

app.use(enableRequestContext);
app.use(requestAndReponseLogger);

app.use(v1Router);

// error handler at the last
app.use(errorHandler);

export default app;
