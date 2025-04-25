import app from './app';
import winstonLogger from './utils/loggers/winston.logger';
import config, { validateConfig } from './config';

validateConfig();

app.listen(config.PORT, () => {
    // console.log(`Server at http://localhost:${PORT}`);
    winstonLogger.info(`Server started at http://localhost:${config.PORT}`);
});
