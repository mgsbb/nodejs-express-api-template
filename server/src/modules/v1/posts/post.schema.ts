import { z } from 'zod';

export const VALIDATION_ERRORS_POST = {
    TITLE_REQUIRED: 'post title is required',
    TITLE_MIN: 'post title must be at least 5 characters',
    TITLE_MAX: 'post title must be at most 100 characters',
    CONTENT_REQUIRED: 'post content is required',
    CONTENT_MIN: 'post content must be at least 10 characters',
    CONTENT_MAX: 'post content must be at most 1000 characters',
    TITLE_CONTENT_REQUIRED: 'post title and post content are required',
    UNRECOGNIZED: 'unrecognized fields are not permitted',
    ONE_FIELD_REQUIRED: 'at least one field is required for updation',
    POST_ID_REQUIRED: 'post id is required',
    POST_ID_POSITIVE: 'post id must be a positive number',
    POST_ID_INT: 'post id cannot contain decimals',
    PAGE_NUMBER_POSITIVE: 'page number must be positive',
    PAGE_NUMBER_INT: 'page number cannot contain decimals',
    PAGE_LIMIT_POSITIVE: 'page limit must be positive',
    PAGE_LIMIT_INT: 'page limit cannot contain decimals',
    SORT_INVALID: 'sortBy can only be: createdAt (or) title (or) content',
    SORT_ORDER_INVALID: 'sortOrder can only be: asc (or) desc',
};

const postSchemaBase = z.object({
    title: z
        .string({ required_error: VALIDATION_ERRORS_POST.TITLE_REQUIRED })
        .min(5, { message: VALIDATION_ERRORS_POST.TITLE_MIN })
        .max(100, { message: VALIDATION_ERRORS_POST.TITLE_MAX }),
    content: z
        .string({
            required_error: VALIDATION_ERRORS_POST.CONTENT_REQUIRED,
        })
        .min(10, { message: VALIDATION_ERRORS_POST.CONTENT_MIN })
        .max(1000, { message: VALIDATION_ERRORS_POST.CONTENT_MAX }),
});

export const postSchemaCreate = z
    .object(postSchemaBase.shape, {
        required_error: VALIDATION_ERRORS_POST.TITLE_CONTENT_REQUIRED,
    })
    .strict({ message: VALIDATION_ERRORS_POST.UNRECOGNIZED });

export const postSchemaUpdate = z
    .object(postSchemaBase.shape, {
        required_error: VALIDATION_ERRORS_POST.ONE_FIELD_REQUIRED,
    })
    .strict({ message: VALIDATION_ERRORS_POST.UNRECOGNIZED })
    .partial()
    .refine(
        (obj) => {
            if (obj.title === undefined && obj.content === undefined) {
                return false;
            }
            return true;
        },
        {
            message: VALIDATION_ERRORS_POST.ONE_FIELD_REQUIRED,
        }
    );

export const postIdParamSchema = z.object({
    postId: z.coerce
        .number({
            required_error: VALIDATION_ERRORS_POST.POST_ID_REQUIRED,
            invalid_type_error: VALIDATION_ERRORS_POST.POST_ID_POSITIVE,
        })
        .positive({ message: VALIDATION_ERRORS_POST.POST_ID_POSITIVE })
        .int({ message: VALIDATION_ERRORS_POST.POST_ID_INT }),
});

export const postSchemaQuery = z
    .object({
        search: z.string(),
        page: z.coerce
            .number()
            .positive(VALIDATION_ERRORS_POST.PAGE_NUMBER_POSITIVE)
            .int(VALIDATION_ERRORS_POST.PAGE_NUMBER_INT),
        limit: z.coerce
            .number()
            .positive(VALIDATION_ERRORS_POST.PAGE_LIMIT_POSITIVE)
            .int(VALIDATION_ERRORS_POST.PAGE_LIMIT_INT),
        sortBy: z.enum(['createdAt', 'title', 'content'], {
            message: VALIDATION_ERRORS_POST.SORT_INVALID,
        }),
        sortOrder: z.enum(['asc', 'desc'], {
            message: VALIDATION_ERRORS_POST.SORT_ORDER_INVALID,
        }),
    })
    .strict()
    .partial()
    .optional();
