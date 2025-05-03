import { RequestHandler } from 'express';
import prismaClient from '#src/utils/prisma-db/prisma-client.db';

export const healthCheckHandler: RequestHandler = async (req, res) => {
    await prismaClient.$queryRaw`SELECT 1`;

    res.status(200).json({ message: 'OK' });
};
