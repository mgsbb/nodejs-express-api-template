import express from 'express';

import sampleRouter from './routes/sampleRoute';
import errorHandler from './middlewares/errorMiddleware';

const PORT = process.env.PORT;

const app = express();

app.use(sampleRouter);

// error handler at the last
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server at http://localhost:${PORT}`));
