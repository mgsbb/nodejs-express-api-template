import winston, { transports, type transport, format } from 'winston';

const logTransports: transport[] = [new transports.Console()];
const fileTransports = [
    new transports.File({
        filename: `logs/error.log`,
        level: 'error',
    }),
    new transports.File({ filename: `logs/app.log` }),
];

// prevents writing logs to file while testing
if (process.env.NODE_ENV !== 'test') {
    logTransports.push(...fileTransports);
}

const { combine, timestamp, label, printf } = format;

const logFormatter = printf(({ level, label, timestamp, message, ...meta }) => {
    // return `${timestamp} [${label}] ${level}: ${message}`;
    // return `{"timestamp": "${timestamp}", "level": "${level}", "label": "${label}", "message": "${message}"}`;

    return JSON.stringify({
        timestamp,
        label,
        level,
        message,
        ...meta,
    });
});

const labelValue = process.env.NODE_ENV === 'development' ? 'dev' : 'prod';

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
