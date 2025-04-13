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
};
