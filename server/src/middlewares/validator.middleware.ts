import { z, type ZodSchema } from 'zod';
import { type Request, type Response, type NextFunction } from 'express';

export function validateInput(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        // TODO: find a way for zod to handle this. DONE: required_error on the entire object
        // if (req.body === undefined) {
        //     throw new BadRequestError(`${req.method} body cannot be empty`);
        // }

        schema.parse(req.body);

        next();
    };
}

export function validateParam(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        schema.parse(req.params.userId);

        next();
    };
}
