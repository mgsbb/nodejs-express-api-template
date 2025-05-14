import { z } from 'zod';

export const VALIDATION_ERRORS_USER = {
    NAME_START_ALPHABET: 'name must start with an alphabet',
    NAME_MIN: 'name must contain at least 3 characters',
    NAME_MAX: 'name must contain at most 20 characters',
    EMAIL_REQUIRED: 'email is required',
    EMAIL_VALID: 'email must be valid',
    UNRECOGNIZED: 'unrecognized fields are not permitted',
    ONE_FIELD_REQUIRED: 'atleast one field is required for updation',
    USER_ID_REQUIRED: 'user id is required',
    USER_ID_POSITIVE: 'user id must be a positive number',
    USER_ID_INT: 'user id cannot contain decimals',
};

const userSchemaBase = z.object({
    name: z
        .string()
        .regex(/^[A-Za-z]/, {
            message: VALIDATION_ERRORS_USER.NAME_START_ALPHABET,
        })
        .min(3, { message: VALIDATION_ERRORS_USER.NAME_MIN })
        .max(20, { message: VALIDATION_ERRORS_USER.NAME_MAX })
        .optional(),
    email: z
        .string({ required_error: VALIDATION_ERRORS_USER.EMAIL_REQUIRED })
        .email({ message: VALIDATION_ERRORS_USER.EMAIL_VALID }),
});

export const userIdParamSchema = z.object({
    userId: z.coerce
        .number({
            required_error: VALIDATION_ERRORS_USER.USER_ID_REQUIRED,
            invalid_type_error: VALIDATION_ERRORS_USER.USER_ID_POSITIVE,
        })
        .positive({ message: VALIDATION_ERRORS_USER.USER_ID_POSITIVE })
        .int({ message: VALIDATION_ERRORS_USER.USER_ID_INT }),
});

export const userSchemaUpdate = z
    .object(userSchemaBase.shape, {
        required_error: VALIDATION_ERRORS_USER.ONE_FIELD_REQUIRED,
    })
    .strict({ message: VALIDATION_ERRORS_USER.UNRECOGNIZED })
    .partial()
    .refine(
        (obj) => {
            if (obj.email === undefined && obj.name === undefined) {
                return false;
            }
            return true;
        },
        { message: VALIDATION_ERRORS_USER.ONE_FIELD_REQUIRED }
    );
