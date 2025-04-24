jest.mock('../sample.service');

import * as sampleControllers from '../sample.controller';
import { describe, expect, it } from '@jest/globals';
import { type Request, type Response } from 'express';
import * as sampleServices from '../sample.service';
import { mockModule } from '#src/utils/test.util';

const sampleServicesMock = mockModule(sampleServices);

describe('[UNIT] sample controllers', () => {
    describe('sampleGetController', () => {
        it('should get the samples and send the response', async () => {
            // prevents db call
            // jest.spyOn(sampleServices, 'getSamples').mockResolvedValue([]);
            // jest.spyOn(sampleServices, 'getSamples').mockImplementation(
            //     async () => {
            //         return [];
            //     }
            // );

            sampleServicesMock.getSamples.mockResolvedValue([]);

            const req = {} as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const next = jest.fn();

            await sampleControllers.sampleGetController(
                req,
                res as any as Response,
                next
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'sampleGetController',
                samples: [],
            });
        });
    });

    describe('samplePostController', () => {
        it('should call createSample service and send the response', async () => {
            const req = {
                body: { name: 'Name123', email: 'email@email.com' },
            } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const next = jest.fn();

            const sampleToCreate = {
                id: 1,
                name: 'Name123',
                email: 'email@email.com',
            };

            // necesarry to resolve value before the function under test is called
            sampleServicesMock.createSample.mockResolvedValue(sampleToCreate);

            await sampleControllers.samplePostController(
                req,
                res as any as Response,
                next
            );

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'samplePostController',
                createdSample: sampleToCreate,
            });
        });
    });
});
