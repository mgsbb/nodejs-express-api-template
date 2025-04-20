import app from './app';
import winstonLogger from './utils/loggers/winston.logger';

const PORT = process.env.PORT;

app.listen(PORT, () => {
    // console.log(`Server at http://localhost:${PORT}`);
    winstonLogger.info(`Server started at http://localhost:${PORT}`);
});
