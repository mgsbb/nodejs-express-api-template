import { User } from '#src/generated/prisma';
import prismaClient from '#src/utils/prisma-db/prisma-client.db';

interface UserRepoOptions {
    includePassword: boolean;
}

export default class UserRepository {
    public createUser = async (
        data: Pick<User, 'name' | 'password' | 'email'>
    ) => {
        // can also check if user exists with getUserByEmail - requires additional db call
        // trying to create an user with existing email will result in an error
        // NOTE: even though entry creation fails with unique constraint violation, the id seems to be still incrementing
        // NOTE: is the error guaranteed to be a unique constraint violation error? what if some other error occurs?
        // SOLUTION: check the error code and refer to prisma docs

        const user = await prismaClient.user.create({
            data,
            // omit: { password: true, createdAt: true, updatedAt: true },
            select: { id: true, email: true, name: true },
        });

        return user;
    };

    public findUserByEmail = async (
        email: string,
        { includePassword }: UserRepoOptions
    ) => {
        const user = await prismaClient.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                password: includePassword,
            },
        });

        return user;
    };

    public findUserById = async (
        id: number,
        { includePassword }: UserRepoOptions
    ) => {
        const user = await prismaClient.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                password: includePassword,
            },
        });

        return user;
    };

    public updateUser = async (
        id: number,
        data: Partial<User>,
        { includePassword }: UserRepoOptions
    ) => {
        const user = await prismaClient.user.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                password: includePassword,
            },
        });

        return user;
    };

    public deleteUserById = async (id: number) => {
        const user = await prismaClient.user.delete({ where: { id } });

        return user;
    };

    public findUsers = async () => {
        const users = await prismaClient.user.findMany({
            select: { id: true, email: true, name: true },
        });

        return users;
    };
}
