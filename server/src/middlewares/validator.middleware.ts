import { z, type ZodSchema } from 'zod';
import { type Request, type Response, type NextFunction } from 'express';
import { BadRequestError } from '#src/utils/custom-errors.util';
import winstonLogger from '#src/utils/loggers/winston.logger';

export function validateInput(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        // TODO: find a way for zod to handle this. DONE: required_error on the entire object
        // if (req.body === undefined) {
        //     throw new BadRequestError(`${req.method} body cannot be empty`);
        // }

        const result = schema.safeParse(req.body);

        const errors = result.error?.errors;

        if (errors !== undefined) {
            winstonLogger.error(errors);
            const errorMessage = constructErrorMessage(errors);
            throw new BadRequestError(errorMessage);
        }

        next();
    };
}

function constructErrorMessage(errors: z.ZodIssue[]) {
    let errorMessage: string;

    // errorMessage = errors.reduce((accumulator, currentObj) => {
    //     return accumulator + currentObj.message + ', ';
    // }, '');

    errorMessage = errors
        .map((error) => {
            // customize error message using ZodIssueCode
            // if (error.code === z.ZodIssueCode.unrecognized_keys) {
            //     return 'unrecognized keys in body';
            // }
            return error.message;
        })
        .join(', ');

    // Using ZodIssue: {code, path, message}
    // errorMessage = errors
    //     .map((issue) => {
    //         return `${issue.path[0]}: ${issue.message.toLowerCase()}`;
    //     })
    //     .join(', ');

    return errorMessage;
}
