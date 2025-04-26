import { type ErrorRequestHandler } from 'express';
import centralizedErrorHandler from '#src/utils/errors/handler.error';

const errorHandlerMiddleware: ErrorRequestHandler = async (
    error,
    req,
    res,
    next
) => {
    centralizedErrorHandler.handleError(error, res);
};

export default errorHandlerMiddleware;
