import winston, { transports, type transport, format } from 'winston';

const { combine, timestamp, label, printf, json } = format;

// values according to NODE_ENV
let dirname: string;
let labelValue: string;

if (process.env.NODE_ENV === 'development') {
    dirname = 'logs-dev';
    labelValue = 'dev';
} else if (process.env.NODE_ENV === 'test') {
    dirname = 'logs-test';
    labelValue = 'test';
} else {
    dirname = 'logs';
    labelValue = 'prod';
}

// file transport with levelFilter will only log that level
const levelFilter = (level: string) => {
    return format((info) => {
        return info.level === level ? info : false;
    })();
};

const logFormatter = printf(({ level, label, timestamp, message, ...meta }) => {
    return JSON.stringify(
        {
            timestamp,
            label,
            level,
            message,
            ...meta,
        },
        null,
        4
    );
});

const logTransports: transport[] = [new transports.Console()];
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

const winstonLogger = winston.createLogger({
    level: 'info',
    format: combine(
        label({ label: labelValue, message: false }),
        timestamp({ format: 'YYYY-MM-DD HH:MM:SS' }),
        logFormatter
    ),
    transports: logTransports,
});

export default winstonLogger;
