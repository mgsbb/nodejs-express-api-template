import bcrypt from 'bcryptjs';
import prismaClient from '#src/utils/prisma-db/prisma-client.db';
import { type User } from '#src/generated/prisma';
import winstonLogger from '#src/utils/loggers/winston.logger';
import {
    convertPrismaErrorToHTTPError,
    isPrismaError,
} from '#src/utils/prisma-db/prisma-errors.db';
import requestContextStorage from '#src/context/request.context';

export const createUser = async ({
    email,
    name,
    password,
}: Pick<User, 'email' | 'name' | 'password'>) => {
    const hashedPassword = await hashPassword(password);

    // can also check if user exists with getUserByEmail - requires additional db call
    // trying to create an user with existing email will result in an error
    // NOTE: even though entry creation fails with unique constraint violation, the id seems to be still incrementing
    // NOTE: is the error guaranteed to be a unique constraint violation error? what if some other error occurs?
    // SOLUTION: check the error code and refer to prisma docs
    try {
        const user = await prismaClient.user.create({
            data: { email, name, password: hashedPassword },
            // omit: { password: true, createdAt: true, updatedAt: true },
            select: { id: true, email: true, name: true },
        });
        return user;
    } catch (error: any) {
        if (isPrismaError(error)) {
            winstonLogger.error(error.message, {
                label: 'user-service-create-user',
                requestId: requestContextStorage.getContext('requestId'),
                error: {
                    ...error,
                    name: error.name,
                    // stack: error.stack
                },
            });
            const httpError = convertPrismaErrorToHTTPError(error);
            throw httpError;
        }
    }
};

const hashPassword = async (password: string, rounds: number = 10) => {
    const salt = await bcrypt.genSalt(rounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
};

