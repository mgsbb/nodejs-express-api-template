import express from 'express';
import cookieParser from 'cookie-parser';

import sampleRouter from './routes/sampleRoute';
import errorHandler from './middlewares/errorMiddleware';

const PORT = process.env.PORT;

const app = express();

// to capture data from requests
app.use(express.urlencoded());
app.use(express.json());

// to receive req.cookies
app.use(cookieParser());

app.use(sampleRouter);

// error handler at the last
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server at http://localhost:${PORT}`));
