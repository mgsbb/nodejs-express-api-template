import {
    HTTPConflictError,
    HTTPNotFoundError,
    HTTPUnauthorizedError,
} from '#src/utils/errors/http.error';
import {
    filterNullValues,
    filterUndefinedValues,
} from '#src/utils/generic.util';
import authContextStorage from '#src/context/auth.context';
import UserRepository from './user.repository';

export default class UserService {
    private readonly userRepository;

    public constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

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

    public getUsers = async () => {
        const users = await this.userRepository.findUsers();

        return users;
    };
}
