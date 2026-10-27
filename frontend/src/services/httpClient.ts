import axios from 'axios';

const httpClient = axios.create({ baseURL: '/api', timeout: 10000, withCredentials: true });

export default httpClient;
