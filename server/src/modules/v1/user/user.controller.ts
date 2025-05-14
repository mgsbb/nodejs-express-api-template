import { type Request, type Response } from 'express';
import UserService from './user.service';

export default class UserController {
    private readonly userService = new UserService();

    public handleGetUser = async (req: Request, res: Response) => {
        const { userId } = req.params;

        const user = await this.userService.getUserById(Number(userId));

        res.status(200).json({ message: 'Fetched: user', data: { user } });
    };

    public handleUpdateUser = async (req: Request, res: Response) => {
        const { userId } = req.params;
        const { email, name } = req.body;

        const user = await this.userService.updateUser(Number(userId), {
            email,
            name,
        });

        res.status(200).json({ message: 'Updated: user', data: { user } });
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

        res.status(200).json({ message: 'Updated: user password' });
    };

    public handleGetUsers = async (req: Request, res: Response) => {
        const users = await this.userService.getUsers();

        res.status(200).json({ message: 'Fetched: users', data: { users } });
    };
}
