import axios from 'axios';
import { API_BASE_PATH } from '@/constants';

// Unauthenticated Axios instance for public endpoints (no JWT required).
const publicApi = axios.create({
  baseURL: `${API_BASE_PATH}/`,
  headers: { 'Content-Type': 'application/json' },
});

export default publicApi;
