import { HTTPUnauthenticatedError } from '#src/utils/errors/http.error';
import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '#src/config';
import authContextStorage from '#src/context/auth.context';

export const authenticateUser = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies.token;

    // if no token exists, let jwt throw error and handle the error in central error handler
    // if (token === undefined) {
    //     throw new HTTPUnauthenticatedError('Unauthenticated');
    // }

    const decodedToken = <jwt.TokenPayload>jwt.verify(token, config.JWT_SECRET);

    authContextStorage.run(new Map(), () => {
        authContextStorage.setContext('userId', decodedToken.user.id);

        next();
    });
};
