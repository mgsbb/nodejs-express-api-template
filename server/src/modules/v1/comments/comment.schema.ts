import { z } from 'zod';

export const VALIDATION_ERRORS_COMMENT = {
    CONTENT_REQUIRED: 'comment content is required',
    CONTENT_MIN: 'comment content must be at least 10 characters',
    CONTENT_MAX: 'comment content must be at most 1000 characters',
    UNRECOGNIZED: 'unrecognized fields are not permitted',
    COMMENT_ID_REQUIRED: 'comment id is required',
    COMMENT_ID_POSITIVE: 'comment id must be a positive number',
    COMMENT_ID_INT: 'comment id cannot contain decimals',
};

const commentSchemaBase = z.object({
    content: z
        .string({
            required_error: VALIDATION_ERRORS_COMMENT.CONTENT_REQUIRED,
        })
        .min(10, { message: VALIDATION_ERRORS_COMMENT.CONTENT_MIN })
        .max(1000, { message: VALIDATION_ERRORS_COMMENT.CONTENT_MAX }),
});

// create and update schema are exactly the same
export const commentSchemaCreate = z
    .object(commentSchemaBase.shape, {
        required_error: VALIDATION_ERRORS_COMMENT.CONTENT_REQUIRED,
    })
    .strict({ message: VALIDATION_ERRORS_COMMENT.UNRECOGNIZED });

export const commentSchemaUpdate = z
    .object(commentSchemaBase.shape, {
        required_error: VALIDATION_ERRORS_COMMENT.CONTENT_REQUIRED,
    })
    .strict({ message: VALIDATION_ERRORS_COMMENT.UNRECOGNIZED });

export const commentIdParamSchema = z.object({
    commentId: z.coerce
        .number({
            required_error: VALIDATION_ERRORS_COMMENT.COMMENT_ID_REQUIRED,
            invalid_type_error: VALIDATION_ERRORS_COMMENT.COMMENT_ID_POSITIVE,
        })
        .positive({ message: VALIDATION_ERRORS_COMMENT.COMMENT_ID_POSITIVE })
        .int({ message: VALIDATION_ERRORS_COMMENT.COMMENT_ID_INT }),
});
