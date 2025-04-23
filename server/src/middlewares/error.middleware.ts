import { type ErrorRequestHandler } from 'express';
import winstonLogger from '#src/utils/loggers/winston.logger';
import { AppError } from '#src/utils/custom-errors.util';

const errorHandler: ErrorRequestHandler = async (error, req, res, next) => {
    // AppError is manually thrown, original error if any is logged at the source of error, otherwise it is lost.
    // Since it is manually thrown, error.message is assured to be sanitized.
    if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
        return;
    }

    // Errors that are not manually thrown are logged.

    // pass the entire error object for: errors({ stack: true }) to work in winstonLogger
    // (OR) manually handle stack
    winstonLogger.error(error.message, {
        label: 'error-handler',
        requestId: req.requestId,
        // ...error does not include name and stack. name seems to be included when it is something other than "Error"
        error: {
            ...error,
            name: error.name,
            // stack: error.stack
        },
    });

    // Sanitized response is sent.
    res.status(500).json({ message: 'Server error.' });
};

export default errorHandler;
