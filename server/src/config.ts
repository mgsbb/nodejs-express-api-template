import { z } from 'zod';

const configSchema = z.object({
    PORT: z.string().nonempty(),
    NODE_ENV: z.enum(['development', 'production', 'test']),
    DATABASE_URL: z.string().nonempty(),
    DATABASE_URL_TEST: z.string().nonempty(),
});

const config = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_TEST: process.env.DATABASE_URL_TEST,
};

export default config;

/*
NOTE:
winston logger depends on config exported above in this file
import at the top (before: export default config) to see the following errors:
    npm run dev - no problem seems to occur
    npm run test - test fails due to undefined values
*/
import winstonLogger from './utils/loggers/winston.logger';

export function validateConfig() {
    try {
        configSchema.parse(config);
    } catch (error) {
        winstonLogger.error(error);
        throw error;
    }
}
