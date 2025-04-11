import express from 'express';

import sampleRouter from './routes/sampleRoute';

const PORT = process.env.PORT;

const app = express();

app.use(sampleRouter);

app.listen(PORT, () => console.log(`Server at http://localhost:${PORT}`));
