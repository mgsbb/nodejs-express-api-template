import { ErrorRequestHandler } from 'express';

const errorHandler: ErrorRequestHandler = async (error, req, res, next) => {
    console.error(error);

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Server error';

    res.status(statusCode).json({ message });
};

export default errorHandler;
