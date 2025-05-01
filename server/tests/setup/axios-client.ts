import axios from 'axios';

export function getAxiosClient() {
    const axiosClient = axios.create({
        baseURL: `http://localhost:3001/`,
        validateStatus: () => true,
    });
    return axiosClient;
}
