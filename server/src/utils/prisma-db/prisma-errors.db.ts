import {
    PrismaClientKnownRequestError,
    PrismaClientUnknownRequestError,
    PrismaClientRustPanicError,
    PrismaClientInitializationError,
    PrismaClientValidationError,
} from '#src/generated/prisma/runtime/library';
import { HTTPConflictError } from '../errors/http.error';

export function isPrismaError(error: any) {
    return (
        error instanceof PrismaClientKnownRequestError ||
        error instanceof PrismaClientUnknownRequestError ||
        error instanceof PrismaClientRustPanicError ||
        error instanceof PrismaClientInitializationError ||
        error instanceof PrismaClientValidationError
    );
}

export function convertPrismaErrorToHTTPError(error: any) {
    let errorMessage: string;

    // check instanceof not sufficient
    // check error.code (for e.g: P2002) is must

    if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                if (error.meta?.modelName && error.meta?.target) {
                    const { modelName, target } = error.meta as {
                        modelName: string;
                        target: string[];
                    };
                    errorMessage = `already exists: ${modelName.toLowerCase()} ${target.join(
                        ', '
                    )}`;
                    return new HTTPConflictError(errorMessage);
                }
                return new HTTPConflictError('please check your input');
        }
    }

    return error;
}
