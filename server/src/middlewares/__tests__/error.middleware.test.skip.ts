jest.mock('#src/context/request.context');
jest.mock('#src/utils/loggers/winston.logger');

import { type Request } from 'express';
import errorHandler from '../error.middleware';
import winstonLogger from '#src/utils/loggers/winston.logger';
import requestContextStorage from '#src/context/request.context';
import { describe, it, expect } from '@jest/globals';
import {
    HTTPBadRequestError,
    HTTPConflictError,
    HTTPNotFoundError,
    HTTPUnauthenticatedError,
    HTTPUnauthorizedError,
} from '#src/utils/errors/http.error';
import { mockModule } from '#src/utils/test.util';

describe('[UNIT] error handler middleware', () => {
    describe('error not instance of HTTPError', () => {
        it('should return 500 status code and message as server error', async () => {
            const req = {} as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const next = jest.fn();
            const err = new Error('some error');

            // (requestContextStorage.getContext as jest.Mock).mockReturnValue(
            //     'id_value'
            // );

            const requestContextStorageMocked = mockModule(
                requestContextStorage
            );
            requestContextStorageMocked.getContext.mockReturnValue('id_value');

            await errorHandler(err, req, res as any, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'server error',
            });

            // What if logger is set to log error stack? SOLUTION: expect it to be any string
            expect(winstonLogger.error).toHaveBeenCalledWith('some error', {
                error: { name: 'Error', stack: expect.any(String) },
                label: 'error-handler',
                requestId: 'id_value',
            });
        });
    });

    describe('error instance of HTTPError - HTTPBadRequestError', () => {
        it('should return correct status code and message', async () => {
            const req = {} as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const next = jest.fn();
            const err = new HTTPBadRequestError('invalid input');

            await errorHandler(err, req, res as any, next);

            expect(res.status).toHaveBeenCalledWith(300);
            expect(res.json).toHaveBeenCalledWith({
                message: err.message,
            });

            // notice .not
            expect(winstonLogger.error).not.toHaveBeenCalledWith(err.message, {
                error: { name: err.name },
                label: 'error-handler',
            });
        });
    });

    describe('error instance of HTTPError - HTTPConflictError', () => {
        it('should return correct status code and message', async () => {
            const req = {} as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const next = jest.fn();
            const err = new HTTPConflictError('resource exists');

            await errorHandler(err, req, res as any, next);

            expect(res.status).toHaveBeenCalledWith(err.statusCode);
            expect(res.json).toHaveBeenCalledWith({
                message: err.message,
            });

            // notice .not
            expect(winstonLogger.error).not.toHaveBeenCalledWith(err.message, {
                error: { name: err.name },
                label: 'error-handler',
            });
        });
    });

    describe('error instance of HTTPError - HTTPNotFoundError', () => {
        it('should return correct status code and message', async () => {
            const req = {} as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const next = jest.fn();
            const err = new HTTPNotFoundError('resource not found');

            await errorHandler(err, req, res as any, next);

            expect(res.status).toHaveBeenCalledWith(err.statusCode);
            expect(res.json).toHaveBeenCalledWith({
                message: err.message,
            });

            // notice .not
            expect(winstonLogger.error).not.toHaveBeenCalledWith(err.message, {
                error: { name: err.name },
                label: 'error-handler',
            });
        });
    });

    describe('error instance of HTTPError - HTTPUnauthenticatedError', () => {
        it('should return correct status code and message', async () => {
            const req = {} as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const next = jest.fn();
            const err = new HTTPUnauthenticatedError('unauthenticated action');

            await errorHandler(err, req, res as any, next);

            expect(res.status).toHaveBeenCalledWith(err.statusCode);
            expect(res.json).toHaveBeenCalledWith({
                message: err.message,
            });

            // notice .not
            expect(winstonLogger.error).not.toHaveBeenCalledWith(err.message, {
                error: { name: err.name },
                label: 'error-handler',
            });
        });
    });

    describe('error instance of HTTPError - HTTPUnauthorizedError', () => {
        it('should return correct status code and message', async () => {
            const req = {} as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const next = jest.fn();
            const err = new HTTPUnauthorizedError(
                'unauthorized to access resource'
            );

            await errorHandler(err, req, res as any, next);

            expect(res.status).toHaveBeenCalledWith(err.statusCode);
            expect(res.json).toHaveBeenCalledWith({
                message: err.message,
            });

            // notice .not
            expect(winstonLogger.error).not.toHaveBeenCalledWith(err.message, {
                error: { name: err.name },
                label: 'error-handler',
            });
        });
    });
});
