import {
    PrismaClientKnownRequestError,
    PrismaClientUnknownRequestError,
    PrismaClientRustPanicError,
    PrismaClientInitializationError,
    PrismaClientValidationError,
} from '#src/generated/prisma/runtime/library';

export class PrismaErrorUtil {
    static isPrismaError(error: any) {
        return (
            error instanceof PrismaClientKnownRequestError ||
            error instanceof PrismaClientUnknownRequestError ||
            error instanceof PrismaClientRustPanicError ||
            error instanceof PrismaClientInitializationError ||
            error instanceof PrismaClientValidationError
        );
    }

    static constructResponse(error: any) {
        // check instanceof not sufficient
        // check error.code (for e.g: P2002) is must

        if (error instanceof PrismaClientKnownRequestError) {
            switch (error.code) {
                case 'P2002': {
                    const { modelName, target } = error.meta as {
                        modelName: string;
                        target: string[];
                    };
                    const errorMessage = `already exists: ${modelName.toLowerCase()} ${target.join(
                        ', '
                    )}`;
                    const statusCode = 409;
                    return { errorMessage, statusCode };
                }
                case 'P2025': {
                    if (error.meta === undefined) break;
                    const { modelName, cause } = error.meta as {
                        modelName: string;
                        cause: string;
                    };
                    const errorMessage = `${modelName.toLowerCase()} ${cause.toLowerCase()}`;
                    const statusCode = 404;
                    return { errorMessage, statusCode };
                }
            }
        }

        return { errorMessage: 'an error occurred', statusCode: 500 };
    }
}
