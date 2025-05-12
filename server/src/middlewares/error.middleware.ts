import { type ErrorRequestHandler } from 'express';
import { type Response } from 'express';
import { ZodError } from 'zod';
import winstonLogger from '#src/utils/loggers/winston.logger';
import pinoLogger from '#src/utils/loggers/pino.logger';
import { ZodErrorUtil } from '#src/utils/zod.util';
import requestContextStorage from '#src/context/request.context';
import { PrismaErrorUtil } from '#src/utils/prisma-db/prisma-errors.db';
import { HTTPError } from '#src/utils/errors/http.error';
import { JsonWebTokenError } from 'jsonwebtoken';
import { MulterError } from 'multer';

class CentralizedErrorHandler {
    handleError(error: any) {
        if (error instanceof ZodError) {
            const { errorMessage, errorObject } =
                ZodErrorUtil.constructErrorObject(error);
            this.logError(
                error,
                errorMessage,
                'zod-validation-error',
                true,
                false
            );

            return {
                statusCode: 400,
                errorMessage,
                errorObject,
            };
        }

        if (PrismaErrorUtil.isPrismaError(error)) {
            const { errorMessage, statusCode } =
                PrismaErrorUtil.constructResponse(error);
            this.logError(error, errorMessage, 'prisma-error', true, false);

            return { statusCode, errorMessage };
        }

        if (error instanceof HTTPError) {
            this.logError(
                error,
                error.message,
                'custom-http-error',
                true,
                false
            );

            return {
                statusCode: error.statusCode,
                errorMessage: error.message,
            };
        }

        if (error instanceof JsonWebTokenError) {
            this.logError(error, error.message, 'jwt-error', true, false);

            return { statusCode: 401, errorMessage: 'Unauthenticated' };
        }

        if (error instanceof MulterError) {
            this.logError(error, error.message, 'multer-error', true, false);

            return {
                statusCode: 400,
                errorMessage: `${error.field} ${error.message.toLowerCase()}`,
            };
        }

        this.logError(error, error.message, 'unexpected-error', false, true);

        return { statusCode: 500, errorMessage: 'Server error' };
    }

    logError(
        error: any,
        message: string,
        label?: string,
        isOperational?: boolean,
        isLogStack?: boolean
    ) {
        // winstonLogger.error(message, {
        //     label,
        //     requestId: requestContextStorage.getContext('requestId'),
        //     isOperational,
        //     error: {
        //         ...error,
        //         stack: isLogStack ? error.stack : undefined,
        //     },
        // });
        pinoLogger.error(
            {
                label,
                requestId: requestContextStorage.getContext('requestId'),
                isOperational,
                error: {
                    ...error,
                    stack: isLogStack ? error.stack : undefined,
                },
            },
            message
        );
    }
}

const centralizedErrorHandler = new CentralizedErrorHandler();

const errorHandlerMiddleware: ErrorRequestHandler = async (
    error,
    req,
    res,
    next
) => {
    const { errorMessage, statusCode, errorObject } =
        centralizedErrorHandler.handleError(error);
    res.status(statusCode).json({ message: errorMessage, error: errorObject });
};

export default errorHandlerMiddleware;
