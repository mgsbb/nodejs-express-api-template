import { User } from '#src/generated/prisma';
import prismaClient from '#src/utils/prisma-db/prisma-client.db';

interface UserRepoOptions {
    includePassword: boolean;
}

export default class UserRepository {
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
