import { z, type ZodSchema } from 'zod';
import { type Request, type Response, type NextFunction } from 'express';
import { HTTPBadRequestError } from '#src/utils/errors/http.error';
import winstonLogger from '#src/utils/loggers/winston.logger';
import requestContextStorage from '#src/context/request.context';
import { constructErrorMessage } from '#src/utils/zod.util';

export function validateInput(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        // TODO: find a way for zod to handle this. DONE: required_error on the entire object
        // if (req.body === undefined) {
        //     throw new BadRequestError(`${req.method} body cannot be empty`);
        // }

        const result = schema.safeParse(req.body);

        const errors = result.error?.errors;

        if (errors !== undefined) {
            winstonLogger.log({
                level: 'error',
                message: 'validation error',
                label: 'validator',
                requestId: requestContextStorage.getContext('requestId'),
                error: {
                    ...result.error,
                    stack: result.error?.stack,
                },
            });
            const errorMessage = constructErrorMessage(errors);
            throw new HTTPBadRequestError(errorMessage);
        }

        next();
    };
}
