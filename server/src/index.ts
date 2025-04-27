import app from './app';
import config, { validateConfig } from './config';
import winstonLogger from './utils/loggers/winston.logger';

try {
    validateConfig();
} catch (error) {
    // not logged to file?
    winstonLogger.error(error);
    process.exit(1);
}

app.listen(config.PORT, () => {
    // console.log(`Server at http://localhost:${PORT}`);
    winstonLogger.info(`Server started at http://localhost:${config.PORT}`);
});
