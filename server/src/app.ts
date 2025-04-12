import express from 'express';
import cookieParser from 'cookie-parser';

import sampleRouter from './routes/sampleRoute';
import errorHandler from './middlewares/errorMiddleware';
import { requestLogger } from './middlewares/loggerMiddleware';

const app = express();

// to capture data from requests
app.use(express.urlencoded());
app.use(express.json());

// to receive req.cookies
app.use(cookieParser());

app.use(requestLogger);

app.use(sampleRouter);

// error handler at the last
app.use(errorHandler);

export default app;
