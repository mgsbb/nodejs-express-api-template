import { type Request, type Response, type NextFunction } from 'express';
import winstonLogger from '#src/utils/loggers/winston.logger';
import requestContextStorage from '#src/context/request.context';

// manual - using console.log()
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

interface RequestDetails {
    method: string;
    url: string;
    ip?: string;
    userAgent?: string;
    contentType?: string;
}

interface ResponseDetails {
    statusCode: number;
    durationMs: number;
}

interface LogDetails {
    requestId: string;
    request: RequestDetails;
    response: ResponseDetails;
}

// using winston logger
export const requestAndReponseLogger = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const requestDetails: RequestDetails = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        contentType: req.headers['content-type'],
    };

    const responseDetails: ResponseDetails = {
        statusCode: 0,
        durationMs: 0,
    };

    const logDetails: LogDetails = {
        requestId: requestContextStorage.getContext('requestId'),
        request: requestDetails,
        response: responseDetails,
    };

    res.on('finish', () => {
        const end = Date.now() - requestContextStorage.getContext('startTime');
        responseDetails.statusCode = res.statusCode;
        responseDetails.durationMs = end;

        winstonLogger.info('Received request', logDetails);
    });

    next();
};
