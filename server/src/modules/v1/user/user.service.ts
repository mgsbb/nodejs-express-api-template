import bcrypt from 'bcryptjs';
import prismaClient from '#src/utils/prisma-db/prisma-client.db';
import { type User } from '#src/generated/prisma';

export default class UserService {
    public createUser = async ({
        email,
        name,
        password,
    }: Pick<User, 'email' | 'name' | 'password'>) => {
        const hashedPassword = await this.hashPassword(password);

        // can also check if user exists with getUserByEmail - requires additional db call
        // trying to create an user with existing email will result in an error
        // NOTE: even though entry creation fails with unique constraint violation, the id seems to be still incrementing
        // NOTE: is the error guaranteed to be a unique constraint violation error? what if some other error occurs?
        // SOLUTION: check the error code and refer to prisma docs
        const user = await prismaClient.user.create({
            data: { email, name, password: hashedPassword },
            // omit: { password: true, createdAt: true, updatedAt: true },
            select: { id: true, email: true, name: true },
        });
        return user;
    };

    private hashPassword = async (password: string, rounds: number = 10) => {
        const salt = await bcrypt.genSalt(rounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    };

    private comparePassword = async (
        password: string,
        hashedPassword: string
    ) => {
        const comparison = await bcrypt.compare(password, hashedPassword);
        return comparison;
    };

    public getUserByEmail = async (email: string) => {
        const user = await prismaClient.user.findUnique({ where: { email } });
        return user;
    };

    public deleteUserById = async (id: number) => {
        const user = await prismaClient.user.delete({ where: { id } });
        return user;
    };
}
