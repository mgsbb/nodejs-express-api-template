import { type Request, type Response } from 'express';
import { createUser } from './user.service';
import { User } from '#src/generated/prisma';

export const handleCreateUser = async (req: Request, res: Response) => {
    const { name, email, password } = req.body as User;
    const user = await createUser({ email, name, password });
    res.status(201).json({ message: 'user created', user });
};

export const handleLoginUser = async (req: Request, res: Response) => {};

export const handleGetUser = async (req: Request, res: Response) => {};

export const handleUpdateUser = async (req: Request, res: Response) => {};

export const handleDeleteUser = async (req: Request, res: Response) => {};
