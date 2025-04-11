import { Request, Response, NextFunction } from 'express';

export const requestLogger = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const currentTime = new Date()
        .toISOString()
        .replace('T', ' ')
        .substring(0, 19);
    console.info(`[${currentTime}](${req.ip}): ${req.method} - ${req.url}`);
    next();
};
