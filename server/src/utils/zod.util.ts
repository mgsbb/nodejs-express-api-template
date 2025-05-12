import { z, ZodError } from 'zod';

export class ZodErrorUtil {
    // UNUSED
    static constructErrorMessageSafeParse(errors: z.ZodIssue[]) {
        const errorMessage = errors
            .map((error) => {
                return error.message;
            })
            .join(', ');

        return errorMessage;
    }

    static constructErrorMessage(error: ZodError) {
        return error.issues.map((issue) => issue.message).join(', ');
    }

    static constructErrorObject(error: ZodError) {
        const errorObject = error.issues.map((issue) => {
            // issue.path[0] returns correct output when there are no nested object keys
            // TODO: handle nested object keys
            if (
                issue.code === 'invalid_type' ||
                issue.code == 'invalid_string' ||
                issue.code === 'too_small' ||
                issue.code === 'too_big' ||
                issue.code === 'custom'
            ) {
                return {
                    field: issue.path[0],
                    message: issue.message,
                };
            }
            if (issue.code === 'unrecognized_keys') {
                return { field: issue.keys[0], message: issue.message };
            }
        });

        return { errorObject, errorMessage: 'Validation error' };
    }
}
