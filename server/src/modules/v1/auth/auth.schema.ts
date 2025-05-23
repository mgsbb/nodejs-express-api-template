import { z } from 'zod';

export const VALIDATION_ERRORS_AUTH = {
    NAME_INVALID_TYPE: 'name must be a string',
    NAME_START_ALPHABET: 'name must start with an alphabet',
    NAME_MIN: 'name must contain at least 3 characters',
    NAME_MAX: 'name must contain at most 20 characters',
    EMAIL_INVALID_TYPE: 'email must be a string',
    EMAIL_REQUIRED: 'email is required',
    EMAIL_VALID: 'email must be valid',
    PASSWORD_INVALID_TYPE: 'password must be a string',
    PASSWORD_REQUIRED: 'password is required',
    PASSWORD_MIN: 'password must contain at least 8 characters',
    PASSWORD_MAX: 'password must contain at most 128 characters',
    PASSWORD_UPPERCASE: 'password must contain atleast one uppercase character',
    PASSWORD_LOWERCASE: 'password must contain atleast one lowercase character',
    PASSWORD_NUMERIC: 'password must contain atleast one numeric character',
    PASSWORD_SPECIAL: 'password must contain atleast one special character',
    EMAIL_PASSWORD_REQUIRED: 'email and password are required',
    UNRECOGNIZED: 'unrecognized fields are not permitted',
    OLD_NEW_REQUIRED: 'old password and new password are required',
    OLD_NEW_SAME: 'new password cannot be the same as old password',
};

const authSchemaBase = z.object({
    name: z
        .string({
            invalid_type_error: VALIDATION_ERRORS_AUTH.NAME_INVALID_TYPE,
        })
        .regex(/^[A-Za-z]/, {
            message: VALIDATION_ERRORS_AUTH.NAME_START_ALPHABET,
        })
        .min(3, { message: VALIDATION_ERRORS_AUTH.NAME_MIN })
        .max(20, { message: VALIDATION_ERRORS_AUTH.NAME_MAX })
        .optional(),
    email: z
        .string({
            required_error: VALIDATION_ERRORS_AUTH.EMAIL_REQUIRED,
            invalid_type_error: VALIDATION_ERRORS_AUTH.EMAIL_INVALID_TYPE,
        })
        .email({ message: VALIDATION_ERRORS_AUTH.EMAIL_VALID }),
    password: z
        .string({
            required_error: VALIDATION_ERRORS_AUTH.PASSWORD_REQUIRED,
            invalid_type_error: VALIDATION_ERRORS_AUTH.PASSWORD_INVALID_TYPE,
        })
        .min(8, { message: VALIDATION_ERRORS_AUTH.PASSWORD_MIN })
        .max(128, { message: VALIDATION_ERRORS_AUTH.PASSWORD_MAX })
        .regex(/[A-Z]/, { message: VALIDATION_ERRORS_AUTH.PASSWORD_UPPERCASE })
        .regex(/[a-z]/, { message: VALIDATION_ERRORS_AUTH.PASSWORD_LOWERCASE })
        .regex(/[0-9]/, { message: VALIDATION_ERRORS_AUTH.PASSWORD_NUMERIC })
        .regex(/[!@#$%^&*()]/, {
            message: VALIDATION_ERRORS_AUTH.PASSWORD_SPECIAL,
        }),
});

export const authSchemaRegister = z
    .object(authSchemaBase.shape, {
        message: VALIDATION_ERRORS_AUTH.EMAIL_PASSWORD_REQUIRED,
    })
    .strict({ message: VALIDATION_ERRORS_AUTH.UNRECOGNIZED });

export const authSchemaLogin = z
    .object(authSchemaBase.shape, {
        required_error: VALIDATION_ERRORS_AUTH.EMAIL_PASSWORD_REQUIRED,
    })
    .omit({ name: true })
    // password check of min, max, characters will NOT be done
    .extend({
        password: z.string({
            required_error: VALIDATION_ERRORS_AUTH.PASSWORD_REQUIRED,
            invalid_type_error: VALIDATION_ERRORS_AUTH.PASSWORD_INVALID_TYPE,
        }),
    })
    .strict({ message: VALIDATION_ERRORS_AUTH.UNRECOGNIZED });

export const authSchemaUpdatePassword = z
    .object(
        {
            // TODO: how to change the error messages to contain "old" and "new"?
            oldPassword: authSchemaBase.shape.password,
            newPassword: authSchemaBase.shape.password,
        },
        { message: VALIDATION_ERRORS_AUTH.OLD_NEW_REQUIRED }
    )
    .strict({ message: VALIDATION_ERRORS_AUTH.UNRECOGNIZED })
    .refine((obj) => obj.oldPassword !== obj.newPassword, {
        message: VALIDATION_ERRORS_AUTH.OLD_NEW_SAME,
    });
