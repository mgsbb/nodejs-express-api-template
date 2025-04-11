import { Request, Response, NextFunction } from 'express';

export const sampleGetController = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        res.status(200).json({ message: 'sampleGetController' });
    } catch (error) {
        // asynchronous errors must be passed on to next function
        next(error);
    }
};
