import winston, { transport, transports, format } from 'winston';
import config from '#src/config';

const { combine, timestamp, printf, json, errors, metadata } = format;

// values according to NODE_ENV
let dirname: string;

if (config.NODE_ENV === 'development') {
    dirname = 'logs-dev-winston';
} else if (config.NODE_ENV === 'test') {
    dirname = 'logs-test-winston';
} else {
    dirname = 'logs-winston';
}

// file transport with levelFilter will only log that level
const levelFilter = (level: string) => {
    return format((info) => {
        return info.level === level ? info : false;
    })();
};

const logFormatter = printf(({ level, timestamp, label, message, ...meta }) => {
    return JSON.stringify(
        {
            timestamp,
            level,
            label,
            message,
            ...meta,
        },
        null,
        4
    );
});

const logTransports: transport[] = [];
const fileTransports = [
    new transports.File({
        dirname,
        filename: `error.log`,
        level: 'error',
    }),
    new transports.File({
        dirname,
        filename: `app.log`,
        level: 'info',
        format: combine(levelFilter('info')),
    }),
];

logTransports.push(...fileTransports);

if (config.NODE_ENV === 'development') {
    logTransports.push(new transports.Console());
}

const winstonLogger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:MM:SS' }),
        // json(),
        errors({ stack: true }),
        logFormatter
    ),
    transports: logTransports,
});

export default winstonLogger;
