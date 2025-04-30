import { z } from 'zod';

const configSchema = z.object({
    PORT: z.string().nonempty(),
    NODE_ENV: z.enum(['development', 'production', 'test']),
    DATABASE_URL: z.string().nonempty(),
    JWT_SECRET: z.string().nonempty(),
});

const config = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET!,
};

export default config;

export function validateConfig() {
    configSchema.parse(config);
}
