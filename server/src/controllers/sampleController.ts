import { Request, Response, NextFunction } from 'express';

export const sampleGetController = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const query = req.query;

        console.log(query);

        res.status(200).json({ message: 'sampleGetController' });
    } catch (error) {
        // asynchronous errors must be passed on to next function
        next(error);
    }
};

export const samplePostController = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // requires express.json() or express.urlencoded()
        const requestBody = req.body;
        console.log(requestBody);

        // requires cookieParser middleware
        const cookies = req.cookies;
        console.log(cookies);

        res.status(200).json({ message: 'samplePostController' });
    } catch (error) {
        next(error);
    }
};
