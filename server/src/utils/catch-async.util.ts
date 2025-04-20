import { type Request, type Response, type NextFunction } from 'express';

type AsyncController = (
    req: Request,
    res: Response,
    next?: NextFunction
) => Promise<void>;

export const catchAsyncError = (fn: AsyncController) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            next(error);
        }
    };
};
