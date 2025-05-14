import { type RequestHandler } from 'express';
import AuthService from './auth.service';
import { User } from '#src/generated/prisma';

export default class AuthController {
    private readonly authService = new AuthService();

    public handleRegisterUser: RequestHandler = async (req, res) => {
        const { name, email, password } = req.body as User;

        const user = await this.authService.createUser({
            email,
            name,
            password,
        });

        res.status(201).json({ message: 'Created: user', data: { user } });
    };

    public handleLoginUser: RequestHandler = async (req, res) => {
        const { email, password } = req.body as User;

        const { token, user } = await this.authService.loginUser({
            email,
            password,
        });

        res.cookie('token', token, { httpOnly: true });

        res.status(200).json({ message: 'Logged in', data: { user } });
    };

    public handleUpdateUserPassword: RequestHandler = async (req, res) => {
        const { oldPassword, newPassword } = req.body;

        await this.authService.updateUserPassword(oldPassword, newPassword);

        res.status(200).json({ message: 'Updated: user password' });
    };
}
