import { type ErrorRequestHandler } from 'express';
import { type Response } from 'express';
import { ZodError } from 'zod';
import winstonLogger from '#src/utils/loggers/winston.logger';
import { ZodErrorUtil } from '#src/utils/zod.util';
import requestContextStorage from '#src/context/request.context';
import { PrismaErrorUtil } from '#src/utils/prisma-db/prisma-errors.db';
import { HTTPError } from '#src/utils/errors/http.error';
import { JsonWebTokenError } from 'jsonwebtoken';
import { MulterError } from 'multer';

class CentralizedErrorHandler {
    handleError(error: any) {
        if (error instanceof ZodError) {
            const errorMessage = ZodErrorUtil.constructErrorMessage(error);
            this.logError(error, errorMessage, 'validation-error', true, false);

            return { statusCode: 400, message: errorMessage };
        }

        if (PrismaErrorUtil.isPrismaError(error)) {
            const { errorMessage, statusCode } =
                PrismaErrorUtil.constructResponse(error);
            this.logError(error, errorMessage, 'prisma-error', true, false);

            return { statusCode, message: errorMessage };
        }

        if (error instanceof HTTPError) {
            this.logError(error, error.message, 'custom-error', true, false);

            return { statusCode: error.statusCode, message: error.message };
        }

        if (error instanceof JsonWebTokenError) {
            this.logError(error, error.message, 'jwt-error', true, false);

            return { statusCode: 401, message: 'unauthenticated' };
        }

        if (error instanceof MulterError) {
            this.logError(error, error.message, 'multer-error', true, false);

            return {
                statusCode: 400,
                message: `${error.field} ${error.message.toLowerCase()}`,
            };
        }

        this.logError(error, error.message, 'unexpected-error', false, true);

        return { statusCode: 500, message: 'Server error' };
    }

    logError(
        error: any,
        message: string,
        label?: string,
        isOperational?: boolean,
        isLogStack?: boolean
    ) {
        winstonLogger.error(message, {
            label,
            requestId: requestContextStorage.getContext('requestId'),
            isOperational,
            error: {
                ...error,
                stack: isLogStack ? error.stack : undefined,
            },
        });
    }
}

const centralizedErrorHandler = new CentralizedErrorHandler();

const errorHandlerMiddleware: ErrorRequestHandler = async (
    error,
    req,
    res,
    next
) => {
    const { message, statusCode } = centralizedErrorHandler.handleError(error);
    res.status(statusCode).json({ message });
};

export default errorHandlerMiddleware;
