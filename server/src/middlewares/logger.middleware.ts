import { Request, Response, NextFunction } from 'express';
import winstonLogger from '#src/utils/loggers/winston.logger';

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
}

interface ResponseDetails {
    statusCode: number;
    message: string;
}

interface LogDetails {
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
        url: req.url,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
    };

    const responseDetails: ResponseDetails = {
        statusCode: 0,
        message: '',
    };

    const logDetails: LogDetails = {
        request: requestDetails,
        response: responseDetails,
    };

    res.on('finish', () => {
        responseDetails.statusCode = res.statusCode;
        winstonLogger.info('Received request', logDetails);
    });

    next();
};
