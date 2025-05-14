import { RefreshToken, User } from '#src/generated/prisma';
import prismaClient from '#src/utils/prisma-db/prisma-client.db';

interface IAuthRepoOptions {
    includePassword: boolean;
}

export default class AuthRepository {
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

    public getUserByEmail = async (
        email: string,
        { includePassword }: IAuthRepoOptions
    ) => {
        const user = await prismaClient.user.findUnique({
            where: { email },
            omit: { password: !includePassword },
        });

        return user;
    };

    public findUserById = async (
        id: number,
        { includePassword }: IAuthRepoOptions
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
        { includePassword }: IAuthRepoOptions
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

    public createRefreshToken = async ({
        jti,
        userId,
        expiresAt,
    }: Pick<RefreshToken, 'jti' | 'userId' | 'expiresAt'>) => {
        await prismaClient.refreshToken.create({
            data: { jti, userId, expiresAt },
        });
    };

    public findRefreshTokenByJti = async (jti: string) => {
        return await prismaClient.refreshToken.findUnique({ where: { jti } });
    };

    public updateRefreshToken = async (
        jti: string,
        { isRevoked, replacedBy }: Partial<RefreshToken>
    ) => {
        return await prismaClient.refreshToken.update({
            where: { jti },
            data: { isRevoked, replacedBy },
        });
    };
}
