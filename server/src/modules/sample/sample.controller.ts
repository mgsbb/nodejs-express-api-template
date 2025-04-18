import { Request, Response, NextFunction } from 'express';
import prismaClient from '../../utils/prisma-client.util';

export const sampleGetController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const query = req.query;
        // console.log(query);

        const samples = await prismaClient.sample.findMany();

        res.status(200).json({ message: 'sampleGetController', samples });
    } catch (error) {
        // asynchronous errors must be passed on to next function
        next(error);
    }
};

export const samplePostController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // requires express.json() or express.urlencoded()
        const requestBody = req.body;
        // console.log(requestBody);

        // requires cookieParser middleware
        const cookies = req.cookies;
        // console.log(cookies);

        const createdSample = await prismaClient.sample.create({
            data: { email: req.body.email, name: req.body.name },
        });

        res.status(201).json({
            message: 'samplePostController',
            createdSample,
        });
    } catch (error) {
        next(error);
    }
};

export const samplePatchController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const params = req.params;
        // console.log(params);

        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
};
