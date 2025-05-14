import bcrypt from 'bcryptjs';
import {
    HTTPConflictError,
    HTTPNotFoundError,
    HTTPUnauthenticatedError,
    HTTPUnauthorizedError,
} from '#src/utils/errors/http.error';
import {
    filterNullValues,
    filterUndefinedValues,
} from '#src/utils/generic.util';
import authContextStorage from '#src/context/auth.context';
import UserRepository from './user.repository';

export default class UserService {
    private readonly userRepository = new UserRepository();

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

    public getUserById = async (id: number) => {
        const user = await this.userRepository.findUserById(id, {
            includePassword: false,
        });

        if (user === null) {
            throw new HTTPNotFoundError('Not found: user');
        }

        return { name: user.name, email: user.email, id: user.id };
    };

    private isOwner = async (id: number) => {
        return authContextStorage.getContext('userId') === id;
    };

    public updateUser = async (
        id: number,
        { name, email }: { name: string | null; email: string }
    ) => {
        if (!(await this.isOwner(id))) {
            throw new HTTPUnauthorizedError('Unauthorized');
        }

        if (email !== undefined) {
            const existingUser = await this.userRepository.findUserByEmail(
                email,
                { includePassword: false }
            );

            if (existingUser !== null && existingUser.id !== id) {
                throw new HTTPConflictError('Already in use: email');
            }
        }

        const user = await this.userRepository.updateUser(
            id,
            {
                ...filterUndefinedValues({
                    ...filterNullValues({ email, name }),
                }),
            },
            { includePassword: false }
        );

        return { name: user.name, email: user.email, id: user.id };
    };

    public deleteUserById = async (id: number) => {
        if (!(await this.isOwner(id))) {
            throw new HTTPUnauthorizedError('Unauthorized');
        }

        const user = await this.userRepository.deleteUserById(id);

        return { name: user.name, email: user.email, id: user.id };
    };

    public updateUserPassword = async (
        id: number,
        oldPassword: string,
        newPassword: string
    ) => {
        if (!(await this.isOwner(id))) {
            throw new HTTPUnauthorizedError('Unauthorized');
        }

        const user = await this.userRepository.findUserById(id, {
            includePassword: true,
        });

        // this will never be case, as id is from the token of a registered and logged in user
        // if (user === null) {
        //     throw new HTTPNotFoundError('user not found');
        // }

        if (!(await this.comparePassword(oldPassword, user?.password || ''))) {
            throw new HTTPUnauthorizedError('Unauthorized');
        }

        const updatedUser = await this.userRepository.updateUser(
            id,
            {
                password: await this.hashPassword(newPassword),
            },
            { includePassword: false }
        );

        return {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
        };
    };

    public getUsers = async () => {
        const users = await this.userRepository.findUsers();

        return users;
    };
}
