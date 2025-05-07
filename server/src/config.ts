import { z } from 'zod';

const configSchema = z.object({
    PORT: z.string().nonempty(),
    NODE_ENV: z.enum(['development', 'production', 'test']),
    DATABASE_URL: z.string().nonempty(),
    JWT_SECRET: z.string().nonempty(),
    CLOUDINARY_CLOUD_NAME: z.string().nonempty(),
    CLOUDINARY_API_KEY: z.string().nonempty(),
    CLOUDINARY_API_SECRET: z.string().nonempty(),
});

const config = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    // jwt secret CANNOT be undefined
    JWT_SECRET: process.env.JWT_SECRET!,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

export default config;

export function validateConfig() {
    configSchema.parse(config);
}
