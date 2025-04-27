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

    public handleGetUser = async (req: Request, res: Response) => {};

    public handleUpdateUser = async (req: Request, res: Response) => {};

    public handleDeleteUser = async (req: Request, res: Response) => {};
}
