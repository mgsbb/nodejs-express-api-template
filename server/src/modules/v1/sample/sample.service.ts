import prismaClient from '#src/utils/prisma-client.util';
import { type SampleSchemaBase } from './sample.schema';

export const getSamples = async () => {
    const samples = await prismaClient.sample.findMany();
    return samples;
};

export const createSample = async (sampleData: SampleSchemaBase) => {
    const sample = await prismaClient.sample.create({ data: sampleData });
    return sample;
};
