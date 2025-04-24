import { z } from 'zod';

export function constructErrorMessage(errors: z.ZodIssue[]) {
    let errorMessage: string;

    errorMessage = errors
        .map((error) => {
            return error.message;
        })
        .join(', ');

    return errorMessage;
}
