import { userSchemaRegister, VALIDATION_ERRORS_USER } from '../user.schema';
import { describe, it, expect } from '@jest/globals';
import { ZodErrorUtil } from '#src/utils/zod.util';
import { z } from 'zod';

describe('[UNIT] userSchemaRegister', () => {
    // for invalid inputs, make sure only 1 validation error is present
    describe('name does NOT start with an alphabet', () => {
        it(`must result in appropriate error message: ${VALIDATION_ERRORS_USER.NAME_START_ALPHABET}`, () => {
            const input = {
                name: '1234abcd',
                email: 'email@email.com',
                password: 'Aa1!BBBBBBBB',
            };

            // expect(() => userSchemaRegister.parse(input)).toThrow();

            try {
                userSchemaRegister.parse(input);
            } catch (error) {
                expect(error).toBeInstanceOf(z.ZodError);
                expect(ZodErrorUtil.constructErrorMessage(error as any)).toBe(
                    VALIDATION_ERRORS_USER.NAME_START_ALPHABET
                );
            }
        });
    });

    describe('name does NOT contain at least 3 characters', () => {
        it(`must result in appropriate error message: ${VALIDATION_ERRORS_USER.NAME_MIN}`, () => {
            const input = {
                name: 'ab',
                email: 'email@email.com',
                password: 'Aa1!BBBBBBBB',
            };

            userSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);
                expect(ZodErrorUtil.constructErrorMessage(error as any)).toBe(
                    VALIDATION_ERRORS_USER.NAME_MIN
                );
            });
        });
    });

    describe('name does NOT contain at most 20 characters', () => {
        it(`must result in appropriate error message: ${VALIDATION_ERRORS_USER.NAME_MAX}`, () => {
            const input = {
                name: 'ababababababababababababababababababababababababab',
                email: 'email@email.com',
                password: 'Aa1!BBBBBBBB',
            };

            userSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);
                expect(ZodErrorUtil.constructErrorMessage(error as any)).toBe(
                    VALIDATION_ERRORS_USER.NAME_MAX
                );
            });
        });
    });

    describe('email is NOT provided', () => {
        it(`must result in appropriate error message: ${VALIDATION_ERRORS_USER.EMAIL_REQUIRED}`, () => {
            const input = {
                name: 'name123',
                password: 'Aa1!BBBBBBBB',
            };

            userSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);
                expect(ZodErrorUtil.constructErrorMessage(error as any)).toBe(
                    VALIDATION_ERRORS_USER.EMAIL_REQUIRED
                );
            });
        });
    });

    describe('email is INVALID', () => {
        it(`must result in appropriate error message: ${VALIDATION_ERRORS_USER.EMAIL_VALID}`, () => {
            const input = {
                name: 'name123',
                email: 'email',
                password: 'Aa1!BBBBBBBB',
            };

            userSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);
                expect(ZodErrorUtil.constructErrorMessage(error as any)).toBe(
                    VALIDATION_ERRORS_USER.EMAIL_VALID
                );
            });
        });
    });

    describe('password is NOT provided', () => {
        it(`must result in appropriate error message: ${VALIDATION_ERRORS_USER.PASSWORD_REQUIRED}`, () => {
            const input = {
                name: 'name123',
                email: 'email@email.com',
            };

            userSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);
                expect(ZodErrorUtil.constructErrorMessage(error as any)).toBe(
                    VALIDATION_ERRORS_USER.PASSWORD_REQUIRED
                );
            });
        });
    });

    describe('password does NOT contain at least 8 characters', () => {
        it(`must result in appropriate error message: ${VALIDATION_ERRORS_USER.PASSWORD_MIN}`, () => {
            const input = {
                name: 'name123',
                email: 'email@email.com',
                password: 'Aa1!BB',
            };

            userSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);
                expect(ZodErrorUtil.constructErrorMessage(error as any)).toBe(
                    VALIDATION_ERRORS_USER.PASSWORD_MIN
                );
            });
        });
    });

    describe('password does NOT contain at most 128 characters', () => {
        it(`must result in appropriate error message: ${VALIDATION_ERRORS_USER.PASSWORD_MAX}`, () => {
            const input = {
                name: 'name123',
                email: 'email@email.com',
                password:
                    'Aa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBB',
            };

            userSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);
                expect(ZodErrorUtil.constructErrorMessage(error as any)).toBe(
                    VALIDATION_ERRORS_USER.PASSWORD_MAX
                );
            });
        });
    });

    describe('password does NOT contain uppercase', () => {
        it(`must result in appropriate error message: ${VALIDATION_ERRORS_USER.PASSWORD_UPPERCASE}`, () => {
            const input = {
                name: 'name123',
                email: 'email@email.com',
                password: '12345678a!',
            };

            userSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);
                expect(ZodErrorUtil.constructErrorMessage(error as any)).toBe(
                    VALIDATION_ERRORS_USER.PASSWORD_UPPERCASE
                );
            });
        });
    });

    describe('password does NOT contain lowercase', () => {
        it(`must result in appropriate error message: ${VALIDATION_ERRORS_USER.PASSWORD_LOWERCASE}`, () => {
            const input = {
                name: 'name123',
                email: 'email@email.com',
                password: '12345678A!',
            };

            userSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);
                expect(ZodErrorUtil.constructErrorMessage(error as any)).toBe(
                    VALIDATION_ERRORS_USER.PASSWORD_LOWERCASE
                );
            });
        });
    });

    describe('password does NOT contain numeric', () => {
        it(`must result in appropriate error message: ${VALIDATION_ERRORS_USER.PASSWORD_NUMERIC}`, () => {
            const input = {
                name: 'name123',
                email: 'email@email.com',
                password: 'AAAAAAAA!a',
            };

            userSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);
                expect(ZodErrorUtil.constructErrorMessage(error as any)).toBe(
                    VALIDATION_ERRORS_USER.PASSWORD_NUMERIC
                );
            });
        });
    });

    describe('password does NOT contain special', () => {
        it(`must result in appropriate error message: ${VALIDATION_ERRORS_USER.PASSWORD_SPECIAL}`, () => {
            const input = {
                name: 'name123',
                email: 'email@email.com',
                password: 'AAAAAAAA1a',
            };

            userSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);
                expect(ZodErrorUtil.constructErrorMessage(error as any)).toBe(
                    VALIDATION_ERRORS_USER.PASSWORD_SPECIAL
                );
            });
        });
    });

    describe('input is empty object', () => {
        it(`must result in appropriate error message`, () => {
            const input = {};

            const expectedErrorMessage = `${VALIDATION_ERRORS_USER.EMAIL_REQUIRED}, ${VALIDATION_ERRORS_USER.PASSWORD_REQUIRED}`;

            userSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);
                expect(ZodErrorUtil.constructErrorMessage(error as any)).toBe(
                    expectedErrorMessage
                );
            });
        });
    });

    describe('input is undefined', () => {
        it(`must result in appropriate error message: ${VALIDATION_ERRORS_USER.EMAIL_PASSWORD_REQUIRED}`, () => {
            userSchemaRegister.parseAsync(undefined).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);
                expect(ZodErrorUtil.constructErrorMessage(error as any)).toBe(
                    VALIDATION_ERRORS_USER.EMAIL_PASSWORD_REQUIRED
                );
            });
        });
    });

    describe('input contains unrecognized fields', () => {
        it(`must result in appropriate error message: ${VALIDATION_ERRORS_USER.UNRECOGNIZED}`, () => {
            const input = {
                name: 'Name123',
                email: 'email@email.com',
                password: 'Aa!1bbbbbbbb',
                unrecog: 'a value',
            };

            userSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);
                expect(ZodErrorUtil.constructErrorMessage(error as any)).toBe(
                    VALIDATION_ERRORS_USER.UNRECOGNIZED
                );
            });
        });
    });

    describe('input contains multiple validation errors', () => {
        it(`must result in appropriate error message`, () => {
            const input = {
                name: '1a',
                email: 'email',
                password: 'a',
                unrecog: 'a value',
            };

            const expectedErrorMessage = `${VALIDATION_ERRORS_USER.NAME_START_ALPHABET}, ${VALIDATION_ERRORS_USER.NAME_MIN}, ${VALIDATION_ERRORS_USER.EMAIL_VALID}, ${VALIDATION_ERRORS_USER.PASSWORD_MIN}, ${VALIDATION_ERRORS_USER.PASSWORD_UPPERCASE}, ${VALIDATION_ERRORS_USER.PASSWORD_NUMERIC}, ${VALIDATION_ERRORS_USER.PASSWORD_SPECIAL}, ${VALIDATION_ERRORS_USER.UNRECOGNIZED}`;

            userSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);
                expect(ZodErrorUtil.constructErrorMessage(error as any)).toBe(
                    expectedErrorMessage
                );
            });
        });
    });
});
