import tsconfigPathsJest from 'tsconfig-paths-jest';
import tsconfig from './tsconfig.json' assert { type: 'json' };
import dotenv from 'dotenv';

dotenv.config({ path: '../env/.env.test' });

const moduleNameMapper = tsconfigPathsJest(tsconfig);

/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
    testEnvironment: 'node',
    transform: {
        '^.+.tsx?$': ['ts-jest', {}],
    },
    verbose: true,
    testMatch: ['**/**/*.test.ts'],
    forceExit: true,
    // clearMocks: true,
    moduleNameMapper,
    // setupFiles: ['dotenv/config'],
};
