import { Request, Response, NextFunction } from 'express';

export const sampleGetController = (req: Request, res: Response) => {
    try {
        res.status(200).json({ message: 'sampleGetController' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
