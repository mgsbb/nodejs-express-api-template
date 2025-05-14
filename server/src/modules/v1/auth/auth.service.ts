import { HTTPUnauthenticatedError } from '#src/utils/errors/http.error';
import AuthRepository from './auth.repository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '#src/config';

export default class AuthService {
    private readonly authRepository = new AuthRepository();

    public createUser = async ({
        email,
        name,
        password,
    }: {
        email: string;
        password: string;
        name: string | null;
    }) => {
        const hashedPassword = await this.hashPassword(password);

        const user = await this.authRepository.createUser({
            email,
            password: hashedPassword,
            name,
        });

        return { name: user.name, email: user.email, id: user.id };
    };

    public loginUser = async ({
        email,
        password,
    }: {
        email: string;
        password: string;
    }) => {
        const user = await this.authRepository.getUserByEmail(email, {
            includePassword: true,
        });

        if (user === null) {
            throw new HTTPUnauthenticatedError('Invalid credentials');
        }

        if (!(await this.comparePassword(password, user?.password))) {
            throw new HTTPUnauthenticatedError('Invalid credentials');
        }

        const token = jwt.sign(
            { user: { id: user.id, email: user.email, name: user.name } },
            config.JWT_SECRET,
            { expiresIn: 30 }
        );

        return {
            user: { id: user.id, name: user.name, email: user.email },
            token,
        };
    };

    private comparePassword = async (
        password: string,
        hashedPassword: string
    ) => {
        return await bcrypt.compare(password, hashedPassword);
    };

    private hashPassword = async (password: string, rounds: number = 10) => {
        const salt = await bcrypt.genSalt(rounds);

        const hashedPassword = await bcrypt.hash(password, salt);

        return hashedPassword;
    };
}
