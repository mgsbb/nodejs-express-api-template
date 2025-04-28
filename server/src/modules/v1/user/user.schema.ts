import { z } from 'zod';

export const VALIDATION_ERRORS_USER = {
    NAME_START_ALPHABET: 'name must start with an alphabet',
    NAME_MIN: 'name must contain at least 3 characters',
    NAME_MAX: 'name must contain at most 20 characters',
    EMAIL_REQUIRED: 'email is required',
    EMAIL_VALID: 'email must be valid',
    PASSWORD_REQUIRED: 'password is required',
    PASSWORD_MIN: 'password must contain at least 8 characters',
    PASSWORD_MAX: 'password must contain at most 128 characters',
    PASSWORD_UPPERCASE: 'password must contain atleast one uppercase character',
    PASSWORD_LOWERCASE: 'password must contain atleast one lowercase character',
    PASSWORD_NUMERIC: 'password must contain atleast one numeric character',
    PASSWORD_SPECIAL: 'password must contain atleast one special character',
    EMAIL_PASSWORD_REQUIRED: 'email and password are required',
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
    password: z
        .string({
            required_error: VALIDATION_ERRORS_USER.PASSWORD_REQUIRED,
        })
        .min(8, { message: VALIDATION_ERRORS_USER.PASSWORD_MIN })
        .max(128, { message: VALIDATION_ERRORS_USER.PASSWORD_MAX })
        .regex(/[A-Z]/, { message: VALIDATION_ERRORS_USER.PASSWORD_UPPERCASE })
        .regex(/[a-z]/, { message: VALIDATION_ERRORS_USER.PASSWORD_LOWERCASE })
        .regex(/[0-9]/, { message: VALIDATION_ERRORS_USER.PASSWORD_NUMERIC })
        .regex(/[!@#$%^&*()]/, {
            message: VALIDATION_ERRORS_USER.PASSWORD_SPECIAL,
        }),
});

export const userSchemaRegister = z
    .object(userSchemaBase.shape, {
        required_error: VALIDATION_ERRORS_USER.EMAIL_PASSWORD_REQUIRED,
    })
    .strict({ message: VALIDATION_ERRORS_USER.UNRECOGNIZED });

export const userSchemaLogin = z
    .object(userSchemaBase.shape, {
        required_error: VALIDATION_ERRORS_USER.EMAIL_PASSWORD_REQUIRED,
    })
    .omit({ name: true })
    .extend({
        password: z.string({
            required_error: VALIDATION_ERRORS_USER.PASSWORD_REQUIRED,
        }),
    })
    .strict({ message: VALIDATION_ERRORS_USER.UNRECOGNIZED });

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
    .omit({ password: true })
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
