import { Request, Response, NextFunction } from 'express';
import prismaClient from '#src/utils/prisma-client.util';
import { catchAsyncError } from '#src/utils/catch-async.util';

// express 5 catches async errors automatically, the catchAsyncError wrapper is not required
export const sampleGetController = catchAsyncError(
    async (req: Request, res: Response) => {
        const query = req.query;
        // console.log(query);

        const samples = await prismaClient.sample.findMany();

        res.status(200).json({ message: 'sampleGetController', samples });
    }
);

export const samplePostController = catchAsyncError(
    async (req: Request, res: Response) => {
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
    }
);

export const samplePatchController = catchAsyncError(
    async (req: Request, res: Response) => {
        const params = req.params;
        // console.log(params);

        res.sendStatus(204);
    }
);
