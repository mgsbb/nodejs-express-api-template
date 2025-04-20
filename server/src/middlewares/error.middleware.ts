import { ErrorRequestHandler } from 'express';
import winstonLogger from '#src/utils/loggers/winston.logger';

const errorHandler: ErrorRequestHandler = async (error, req, res, next) => {
    winstonLogger.error(error.message, { name: error.name });

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Server error';

    res.status(statusCode).json({ message });
};

export default errorHandler;
