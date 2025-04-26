import { type Response } from 'express';
import { ZodError } from 'zod';
import winstonLogger from '../loggers/winston.logger';
import { ZodErrorUtil } from '../zod.util';
import requestContextStorage from '#src/context/request.context';
import { PrismaErrorUtil } from '../prisma-db/prisma-errors.db';

class CentralizedErrorHandler {
    handleError(error: any, res: Response) {
        if (error instanceof ZodError) {
            const errorMessage = ZodErrorUtil.constructErrorMessage(error);
            this.logError(error, errorMessage, 'validation-error', true, false);

            res.status(400).json({ message: errorMessage });
            return;
        }

        if (PrismaErrorUtil.isPrismaError(error)) {
            const { errorMessage, statusCode } =
                PrismaErrorUtil.constructResponse(error);
            this.logError(error, errorMessage, 'prisma-error', true, false);

            res.status(statusCode).json({ message: errorMessage });
            return;
        }

        res.status(500).json({ message: 'server error' });
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

export default centralizedErrorHandler;
