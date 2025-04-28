import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prismaClient from '#src/utils/prisma-db/prisma-client.db';
import { type User } from '#src/generated/prisma';
import {
    HTTPConflictError,
    HTTPNotFoundError,
    HTTPUnauthenticatedError,
    HTTPUnauthorizedError,
} from '#src/utils/errors/http.error';
import config from '#src/config';
import { filterUndefinedValues } from '#src/utils/generic.util';
import authContextStorage from '#src/context/auth.context';

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

    public loginUser = async ({
        email,
        password,
    }: Pick<User, 'email' | 'password'>) => {
        const user = await prismaClient.user.findUnique({
            where: { email },
        });

        if (user === null) {
            // NotFound or Unauth?
            throw new HTTPUnauthenticatedError('invalid credentials');
        }

        if (!(await this.comparePassword(password, user.password))) {
            throw new HTTPUnauthenticatedError('invalid credentials');
        }

        const token = jwt.sign(
            { user: { id: user.id, email: user.email, name: user.name } },
            config.JWT_SECRET
        );

        return {
            user: { id: user.id, name: user.name, email: user.email },
            token,
        };
    };

    public getUserById = async (id: number) => {
        const user = await prismaClient.user.findUnique({
            where: { id },
            select: { id: true, name: true, email: true },
        });

        if (user === null) {
            throw new HTTPNotFoundError('user not found');
        }

        return user;
    };

    private isOwner = async (id: number) => {
        return authContextStorage.getContext('userId') === id;
    };

    public updateUser = async (
        id: number,
        { name, email }: Partial<Pick<User, 'name' | 'email'>>
    ) => {
        if (!(await this.isOwner(id))) {
            throw new HTTPUnauthorizedError('unauthorized action');
        }

        const existingUser = await prismaClient.user.findUnique({
            where: { email },
        });

        if (existingUser !== null && existingUser.id !== id) {
            throw new HTTPConflictError('email already in use');
        }

        const user = await prismaClient.user.update({
            where: { id },
            data: { ...filterUndefinedValues({ name, email }) },
            select: { id: true, name: true, email: true },
        });

        return user;
    };

    public deleteUserById = async (id: number) => {
        const user = await prismaClient.user.delete({ where: { id } });
        return user;
    };
}
