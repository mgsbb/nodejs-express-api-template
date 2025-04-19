import { z } from 'zod';

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
