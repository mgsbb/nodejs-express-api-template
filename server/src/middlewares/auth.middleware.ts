import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '#src/config';
import authContextStorage from '#src/context/auth.context';

export const authenticateUser = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const accessToken = req.cookies.accessToken;

    // if no token exists, let jwt throw error and handle the error in central error handler
    // if (token === undefined) {
    //     throw new HTTPUnauthenticatedError('Unauthenticated');
    // }

    const decodedToken = <jwt.TokenPayload>(
        jwt.verify(accessToken, config.JWT_SECRET_ACCESS_TOKEN)
    );

    authContextStorage.run(new Map(), () => {
        authContextStorage.setContext('userId', decodedToken.userId);

        next();
    });
};
