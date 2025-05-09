import pino from 'pino';
import config from '#src/config';

let logDir: string;

if (config.NODE_ENV === 'development') {
    logDir = 'logs-dev-pino';
} else if (config.NODE_ENV === 'test') {
    logDir = 'logs-test-pino';
} else {
    logDir = 'logs-pino';
}

const transports: any = {
    targets: [
        {
            target: 'pino/file',
            options: {
                destination: `./${logDir}/app.log`,
                mkdir: true,
            },
            // TODO: how to ensure only info level logs are written?
            level: 'info',
        },
        {
            target: 'pino/file',
            options: {
                destination: `./${logDir}/error.log`,
                mkdir: true,
            },
            level: 'error',
        },
    ],
};

// prevent logging to stdout when running tests
if (config.NODE_ENV !== 'test') {
    transports.targets.push({
        target: 'pino-pretty',
        options: {
            ignore: 'pid,hostname',
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
            colorize: true,
        },
    });
}

const pinoLogger = pino({
    // base undefined removes pid and hostname
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: transports,
});

export default pinoLogger;
