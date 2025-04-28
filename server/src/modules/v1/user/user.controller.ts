import { type Request, type Response } from 'express';
import UserService from './user.service';
import { User } from '#src/generated/prisma';

export default class UserController {
    private readonly userService = new UserService();

    public handleCreateUser = async (req: Request, res: Response) => {
        const { name, email, password } = req.body as User;

        const user = await this.userService.createUser({
            email,
            name,
            password,
        });

        res.status(201).json({ message: 'user created', user });
    };

    public handleLoginUser = async (req: Request, res: Response) => {
        const { email, password } = req.body as User;

        const { token, user } = await this.userService.loginUser({
            email,
            password,
        });

        res.cookie('token', token, { httpOnly: true });

        res.status(200).json({ message: 'login sucessful', user });
    };

    public handleGetUser = async (req: Request, res: Response) => {
        const { userId } = req.params;

        const user = await this.userService.getUserById(Number(userId));

        res.status(200).json({ message: 'user fetch success', user });
    };

    public handleUpdateUser = async (req: Request, res: Response) => {
        const { userId } = req.params;
        const { email, name } = req.body;

        const user = await this.userService.updateUser(Number(userId), {
            email,
            name,
        });

        res.status(200).json({ message: 'user update success', user });
    };

    public handleDeleteUser = async (req: Request, res: Response) => {
        const { userId } = req.params;

        await this.userService.deleteUserById(Number(userId));

        res.sendStatus(204);
    };

    public handleUpdateUserPassword = async (req: Request, res: Response) => {
        const { userId } = req.params;
        const { oldPassword, newPassword } = req.body;

        await this.userService.updateUserPassword(
            Number(userId),
            oldPassword,
            newPassword
        );

        res.sendStatus(204);
    };

    public handleGetUsers = async (req: Request, res: Response) => {
        const users = await this.userService.getUsers();

        res.status(200).json({ message: 'users fetch success', users });
    };
}
