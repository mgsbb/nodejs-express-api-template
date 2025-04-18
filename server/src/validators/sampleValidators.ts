import { z, type ZodSchema } from 'zod';
import { type Request, type Response, type NextFunction } from 'express';
import { BadRequestError } from '../utils/customErrors';

export const VALIDATION_ERRORS_SAMPLE = {
    NAME_REQUIRED: 'name is required',
    NAME_START_ALPHABET: 'name must start with an alphabet',
    NAME_MIN: 'name must contain at least 3 characters',
    NAME_MAX: 'name must contain at most 20 characters',
    EMAIL_REQUIRED: 'email is required',
    EMAIL_VALID: 'email must be valid',
    UNRECOGNIZED: 'unrecognized fields are not permitted',
    ONE_FIELD_REQUIRED: 'atleast one field is required for updation',
    NAME_EMAIL_REQUIRED: 'name and email are required',
};

const sampleSchemaBase = z.object({
    name: z
        .string({ required_error: VALIDATION_ERRORS_SAMPLE.NAME_REQUIRED })
        .regex(/^[A-Za-z]/, {
            message: VALIDATION_ERRORS_SAMPLE.NAME_START_ALPHABET,
        })
        .min(3, { message: VALIDATION_ERRORS_SAMPLE.NAME_MIN })
        .max(20, { message: VALIDATION_ERRORS_SAMPLE.NAME_MAX }),
    email: z
        .string({ required_error: VALIDATION_ERRORS_SAMPLE.EMAIL_REQUIRED })
        .email({ message: VALIDATION_ERRORS_SAMPLE.EMAIL_VALID }),
});

// POST method requires both name and email to be present
export const sampleSchemaPost = z
    .object(sampleSchemaBase.shape, {
        required_error: VALIDATION_ERRORS_SAMPLE.NAME_EMAIL_REQUIRED,
    })
    .strict({ message: VALIDATION_ERRORS_SAMPLE.UNRECOGNIZED });

// PATCH requires atleast one field
export const sampleSchemaPatch = z
    .object(sampleSchemaBase.shape, {
        required_error: VALIDATION_ERRORS_SAMPLE.ONE_FIELD_REQUIRED,
    })
    .strict({ message: VALIDATION_ERRORS_SAMPLE.UNRECOGNIZED })
    .partial()
    .refine(
        (obj) => {
            if (obj.email === undefined && obj.name === undefined) {
                return false;
            }
            return true;
        },
        { message: VALIDATION_ERRORS_SAMPLE.ONE_FIELD_REQUIRED }
    );

type SampleSchemaPost = z.infer<typeof sampleSchemaBase>;

export function validateInput(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        // TODO: find a way for zod to handle this. DONE: required_error on the entire object
        // if (req.body === undefined) {
        //     throw new BadRequestError(`${req.method} body cannot be empty`);
        // }

        const result = schema.safeParse(req.body);

        const errors = result.error?.errors;

        if (errors !== undefined) {
            console.log(errors);
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
