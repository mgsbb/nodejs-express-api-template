import requestContextStorage from '#src/context/request.context';
import { randomUUID } from 'crypto';
import { type Request, type Response, type NextFunction } from 'express';

export function requestContextMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    // declaration merging in types/express.d.ts
    // req.requestId = randomUUID();

    requestContextStorage.run(new Map(), function () {
        requestContextStorage.setContext('requestId', randomUUID());
        requestContextStorage.setContext('startTime', Date.now());
        next();
    });
}
