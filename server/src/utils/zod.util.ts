import { z, ZodError } from 'zod';

export class ZodErrorUtil {
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
}
