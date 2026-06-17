import axios from 'axios';

// Unauthenticated Axios instance for public endpoints (no JWT required).
const publicApi = axios.create({
  baseURL: '/api/v1/',
  headers: { 'Content-Type': 'application/json' },
});

export default publicApi;
