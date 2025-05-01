import { User } from '../../src/generated/prisma';
import { getAxiosClient } from './axios-client';

export async function createAuthenticatedUser(
    email?: string,
    password?: string
) {
    const axiosClient = getAxiosClient();

    const input = { email, password };

    // Create user
    await axiosClient.post('/api/v1/users', input);

    // Login user
    const response = await axiosClient.post('/api/v1/users/login', input);

    const cookie = response.headers['set-cookie']?.[0];

    // TODO: find alternative to this manual method of extraction
    const token = cookie?.split(';')[0].split('=')[1];

    return { input, user: response.data?.user as User, token };
}
